import { Validator, ValidationError } from "./validationTypes";

const error = (message: string, params?: any): ValidationError => {
    return {
        message,
        params,
    }
}

export const required = <RawValue>(
    value: RawValue | undefined
) => {
    if (value === undefined) {
        return error('required');
    }
};

export const minLength = (min: number): Validator<string> => (value) => {
    if (value.length < min) {
        return error('validation.minLength', { min });
    }
};

export const minValue = (min: number): Validator<number> => (value) => {
    if (value < min) {
        return error('validation.min', { min });
    }
};

export const noEmoji: Validator<string> = (value) => {
    if (value.includes('🍆')) {
        return error('come on man')
    }
};

export function all<T>(...validators: Validator<T>[]): Validator<T> {
    return (value) => {
        let currentResult: ValidationError | undefined = undefined;

        for (const validator of validators) {
            const error = validator(value);
            if (error) {
                return error;
            }

            currentResult = error;
        }

        return currentResult;
    }
}

export const modifyError = <T>(validator: Validator<T>, message: string, params?: any): Validator<T> => (value) => {
    const maybeError = validator(value);

    if (maybeError) {
        return error(message, { ...maybeError.params, params })
    }
}