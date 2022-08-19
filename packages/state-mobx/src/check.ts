import { action, makeAutoObservable, observable } from "mobx";
import { getError, ValidationContainer } from "./submit";
import { ValidationError } from "./validation/validationTypes";

export type InteractableAndValidatable = { interactionStatus: 'new' | 'active' | 'wasActive', isValid: boolean };

export type CheckContext = {
    onFieldUsed: (field: InteractableAndValidatable) => void
}

export const checkContext: CheckContext = {
    onFieldUsed: () => { return 'none' }
}

export type Check = ValidationContainer & {
    validationErrors: {
        runtime: ValidationError | undefined;
        backend: ValidationError | undefined;
    };
    interactionStatus: 'new' | 'active' | 'wasActive';
}

export type CheckOptions = { getInteractionStatus: (usedFields: InteractableAndValidatable[]) => Check['interactionStatus'] }

const defaultGetInteractionStatus: CheckOptions['getInteractionStatus'] = (fields) => {
    const allValid = fields.every(field => field.isValid)
    const someAreActive = fields.some(field => field.interactionStatus === 'active');
    const someWereActive = fields.some(field => field.interactionStatus === 'wasActive');

    if (!allValid) {
        return 'new'
    }

    if (someAreActive) {
        return 'active'
    }

    if (someWereActive) {
        return 'wasActive'
    }

    return 'new'
}

export const check = (run: () => ValidationError | undefined, options?: CheckOptions): Check => {
    const usedFields = observable.array([] as InteractableAndValidatable[]);
    const clear = action(() => usedFields.clear());
    const thisCheckContext: CheckContext = { onFieldUsed: action((field) => { usedFields.push(field); return 'check' }) }

    const checkStore: Check = {
        validationErrors: {
            get runtime() {
                clear();
                let lastContext = { ...checkContext };
                Object.assign(checkContext, thisCheckContext);

                try {
                    return run();
                } finally {
                    Object.assign(checkContext, lastContext);
                }
            },
            backend: undefined
        },
        get interactionStatus(): Check['interactionStatus'] {
            if (checkStore.validationErrors.backend) {
                return 'wasActive'
            }

            if (checkStore.validationErrors.runtime === undefined) {
                return 'new'
            }

            return options?.getInteractionStatus(usedFields) ?? defaultGetInteractionStatus(usedFields)
        },
        [getError]() {
            return checkStore.validationErrors.backend || checkStore.validationErrors.runtime
        }
    }

    return makeAutoObservable(checkStore);
}