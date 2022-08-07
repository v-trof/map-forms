import { Validator, ValidationResult } from "./validationTypes";

export const required = <RawValue>(
    value: RawValue | undefined
): ValidationResult<RawValue> => {
    if (value === undefined) {
        return {
            isValid: false,
            error: { message: 'required' }
        };
    }

    return { isValid: true, value };
};
export const minLength = (min: number): Validator<string> => (value) => {
    if (value.length >= min) {
        return {
            isValid: true,
            value
        }
    }

    return {
        isValid: false,
        error: {
            message: 'min-length'
        }
    }
};
export const minValue = (min: number): Validator<number> => (value) => {
    if (value >= min) {
        return {
            isValid: true,
            value
        }
    }

    return {
        isValid: false,
        error: {
            message: 'min-length'
        }
    }
};
export const noEmoji: Validator<string> = (value) => {
    // will implement later
    return {
        isValid: true,
        value
    }
};

export { all, emptyOr, alwaysValid } from './validatorCombinators'

