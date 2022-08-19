import { ValidationError } from "../validation/validationTypes";

export type ErrorContainer = {
    interactionStatus: 'new' | 'active' | 'wasActive', 
    validationErrors: { 
        parsing?: ValidationError | undefined,
        runtime?: ValidationError | undefined,
        backend?: ValidationError | undefined,
        required?: ValidationError | undefined,
    }
}

export const getHighestPriorityError = (field: ErrorContainer): ValidationError | undefined => {
    const errors = field.validationErrors;
    
    if('parse' in errors && errors.parsing) {
        return errors.parsing;
    }

    if(errors.backend) {
        return errors.backend;
    }

    if(errors.required) {
        return errors.required;
    }

    return errors.runtime
}

export const getErrorAfterInteraction = (field: ErrorContainer): ValidationError | undefined => {
    const errors = field.validationErrors;
    const status = field.interactionStatus;

    if(status === 'active') {
        return undefined
    }

    if(status === 'new' && errors.backend) {
        return errors.backend
    }

    if(status === 'wasActive') {
        return getHighestPriorityError(field)
    }
    
    return undefined;
}