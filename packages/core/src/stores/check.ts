import { ensureValid } from "../accessors/valid";
import { computed, makeAutoObservable } from "mobx";
import { getError } from "../protocol/accessAnnotations";
import { createAccessContext } from "../protocol/accessContext";
import { ValidationError } from "../protocol/error";
import { aggregateInteractionStatus, InteractionStatus } from "../protocol/interactionStatus";

export type Check = {
    validationErrors: {
        runtime: ValidationError | undefined;
        backend: ValidationError | undefined;
    };
    interactionStatus: InteractionStatus;
    [getError]: () => ValidationError | undefined;
}

export type Checkable = {
    interactionStatus: InteractionStatus,
    isValid: boolean
};
export type CheckOptions = {
    getInteractionStatus: (usedFields: Checkable[]) => Check['interactionStatus'];
    wrapInEnsureValid: boolean;
}

const defaultOptions: CheckOptions = {
    getInteractionStatus: (fields) => {
        if (fields.some(field => !field.isValid)) {
            return 'new';
        }

        return aggregateInteractionStatus(fields);
    },
    wrapInEnsureValid: true
}

const noop = () => undefined;

export const check = (validate: () => ValidationError | undefined = noop, options?: Partial<CheckOptions>): Check => {
    const { getInteractionStatus, wrapInEnsureValid } = { ...defaultOptions, ...options };
    const getRuntimeValidation = wrapInEnsureValid ? ensureValid(validate) : validate;

    const checkResult = computed(() => {
        let usedFields: Checkable[] = [];
        const releaseAccessContext = createAccessContext('check', (interactionStatus, isValid) => usedFields.push({ interactionStatus, isValid }));

        try {
            const result = getRuntimeValidation();

            return {
                result,
                usedFields
            }
        } finally {
            releaseAccessContext();
        }
    });

    const checkStore: Check = {
        validationErrors: {
            get runtime() {
                return checkResult.get().result
            },
            backend: undefined
        },
        get interactionStatus(): Check['interactionStatus'] {
            if (checkStore.validationErrors.backend) {
                return 'wasActive'
            }

            return getInteractionStatus(checkResult.get().usedFields);
        },
        [getError]() {
            return checkStore.validationErrors.backend || checkStore.validationErrors.runtime
        }
    }

    return makeAutoObservable(checkStore);
}