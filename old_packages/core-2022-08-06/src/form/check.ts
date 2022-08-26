import { ValidationError } from "../validation/validationTypes";

export type Check = {
    validationErrors: {
        [context: string]: ValidationError | undefined
    };
    interactionStatus: 'new' | 'active' | 'wasActive';
}

export const check = (runCheck: () => ValidationError | undefined): Check => {


    return {
        validationErrors: {
            get runtime() {
                return runCheck();
            }
        },
        interactionStatus: 'new' // will be derived from fields
    }
}