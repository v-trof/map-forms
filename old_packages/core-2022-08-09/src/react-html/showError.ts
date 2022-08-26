import { Check, Field } from "../form/field";
import { ValidationError } from "../validation/validationTypes";

export type ShowError = (field: Field<unknown> | Check) => ValidationError | undefined;

export const alwaysShowError: ShowError = (field) => {
    const errors = field.validationErrors;
    
    if('parse' in errors && errors.parse) {
        return errors.parse;
    }

    if(errors.backend) {
        return errors.backend;
    }

    if('requried' in errors && errors.requried) {
        return errors.requried;
    }

    return errors.validator
}

export const showErrorOnInteractionEnd: ShowError = (field) => {
    const errors = field.validationErrors;
    const status = field.interactionStatus;

    if(status === 'active') {
        return undefined
    }

    if(status === 'wasActive') {
        return alwaysShowError(field)
    }

    if(status === 'new' && errors.backend) {
        return errors.backend
    }
    
    return undefined;
}