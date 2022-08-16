import { autoSubmit, ExtractValues } from '../submit';
import { ValidationError, ValidationResult } from '../validation/validationTypes';

const validCtx = { onError: (error: ValidationError) => { } };

export const ensureValid = <T>(getValue: () => T): () => ValidationResult<T> => {
    let maybeValidationError: ValidationError | undefined = undefined;
    let value: T | undefined;

    const thisCtx = {
        onError: (error: ValidationError) => {
            maybeValidationError = error;
        }
    }
    const lastCtx = { ...validCtx };

    return () => {
        maybeValidationError = undefined;
        value = undefined;

        Object.assign(validCtx, thisCtx);
        try {
            value = getValue();
        } catch (error) {
            if (!maybeValidationError) {
                // this code can fail when undefined is returned form valid when it shouldn't
                // in other cases it is definitely an error in code
                throw error;
            }
        } finally {
            Object.assign(validCtx, lastCtx);
        }

        if (maybeValidationError === undefined) {
            return { isValid: true, value: value as T }
        }

        return { isValid: false, error: maybeValidationError }
    }

}

export const valid = <T>(store: T): ExtractValues<T> => {
    const result = autoSubmit(store);

    if (result.isValid) {
        return result.value;
    }

    validCtx.onError(result.error);

    return undefined as any;
}