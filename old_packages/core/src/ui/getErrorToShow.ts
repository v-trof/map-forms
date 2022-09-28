import { ValidationError } from "../protocol/error";
import { InteractionStatus } from "../protocol/interactionStatus";

export type ErrorContainer = {
    interactionStatus: InteractionStatus,
    validationErrors: {
        parsing?: ValidationError | undefined,
        runtime?: ValidationError | undefined,
        backend?: ValidationError | undefined
    }
}


export const getHighestPriorityError = (field: ErrorContainer): ValidationError | undefined => {
    const errors = field.validationErrors;

    if ('parse' in errors && errors.parsing) {
        return errors.parsing;
    }

    if (errors.backend) {
        return errors.backend;
    }

    return errors.runtime
}

export const getErrorAfterInteraction = (field: ErrorContainer): ValidationError | undefined => {
    const errors = field.validationErrors;
    const status = field.interactionStatus;

    if (status === 'active') {
        return undefined
    }

    if (status === 'new' && errors.backend) {
        return errors.backend
    }

    if (status === 'wasActive') {
        return getHighestPriorityError(field)
    }

    return undefined;
}