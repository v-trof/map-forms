import { ValidationError } from "../validation/validationTypes";

export type Errors = {
    [context: string]: ValidationError | undefined
};

export type FieldIntractionStatus = 'new' | 'active' | 'wasActive';
export type FormIntractionStatus = 'new' | 'wasSubmitted';

export type Field<Value> = {
    value: Value;
    validationErrors: Errors;
    // this needs a nicer api
    interactionStatus: FieldIntractionStatus;
}

// where do we put form state through? Context? -> almost good since error display is react-only bs anyways

export const useFieldState = <T>(field: Field<T>) => {
    return {
        value: field.value,
        onChange: (newValue: T) => {
            field.value = newValue;
        },
        onParsingError: (error: ValidationError & { fallbackValue: T }) => {
            field.validationErrors.parsing = error;
            field.value = error.fallbackValue;
        },
        interactionStatus: field.interactionStatus,
        onInteractionStart: () => {
            field.interactionStatus = 'active'
        },
        onInteractionEnd: () => {
            field.interactionStatus = 'wasActive'
        },
        validationErrors: field.validationErrors,
    }
}

export const alwaysShowError = (errors: Errors) => {
    return Object.values(errors).find(x => x !== undefined);
}

export const useField = <T>(field: Field<T>) => {
    const state = useFieldState(field);
    const error = alwaysShowError(field.validationErrors);

    return {
        value: state.value,
        onChange: state.onChange,
        onParsingError: state.onParsingError,
        onInteractionStart: state.onInteractionStart,
        onInteractionEnd: state.onInteractionEnd,
        error
    }
}