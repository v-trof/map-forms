import { makeAutoObservable } from "mobx";
import { AutoSubmitSkip, informalType, ValidationContainer } from "./submit";
import { ValidationError } from "./validation/validationTypes";

export type Check = ValidationContainer & {
    validationErrors: {
        runtime: ValidationError | undefined;
        backend: ValidationError | undefined;
    };
    interactionStatus: 'new' | 'active' | 'wasActive';
}

export const check = (run: () => ValidationError | undefined): Check => {
    const checkStore: Check = makeAutoObservable({
        validationErrors: {
            get runtime() {
                return run();
            },
            backend: undefined
        },
        get interactionStatus(): Check['interactionStatus'] {
            return 'new'
        },
        getError() {
            return checkStore.validationErrors.backend || checkStore.validationErrors.runtime
        },
        [informalType]: 'validationContainer'
    })

    return checkStore;
}