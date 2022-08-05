import { ValidationResult, Validator } from "./validationTypes";

export const emptyOr = <RawValue, ValidValue>(
    validator: Validator<RawValue, ValidValue>
): Validator<RawValue | undefined, ValidValue | undefined> => (value) => {
    if (value === undefined) {
        return {
            isValid: true,
            value: undefined
        }
    }

    return validator(value);
};

export const alwaysValid = <T>(value: T): ValidationResult<T> => {
    return {
        isValid: true,
        value
    };
};

export function all<RawValue, ValidValue>(
    v1: Validator<RawValue, ValidValue>,
): Validator<RawValue, ValidValue>;

export function all<RawValue, ValidValue1, ValidValue2>(
    v1: Validator<RawValue, ValidValue1>,
    v2: Validator<ValidValue1, ValidValue2>,
): Validator<RawValue, ValidValue1>;

export function all<RawValue, ValidValue1, ValidValue2, ValidValue3>(
    v1: Validator<RawValue, ValidValue1>,
    v2: Validator<ValidValue1, ValidValue2>,
    v3: Validator<ValidValue2, ValidValue3>,
): Validator<RawValue, ValidValue3>;

export function all<RawValue, ValidValue1, ValidValue2, ValidValue3, ValidValue4>(
    v1: Validator<RawValue, ValidValue1>,
    v2: Validator<ValidValue1, ValidValue2>,
    v3: Validator<ValidValue2, ValidValue3>,
    v4: Validator<ValidValue3, ValidValue4>,
): Validator<RawValue, ValidValue4>;

export function all<RawValue, ValidValue1, ValidValue2, ValidValue3, ValidValue4, ValidValue5>(
    v1: Validator<RawValue, ValidValue1>,
    v2: Validator<ValidValue1, ValidValue2>,
    v3: Validator<ValidValue2, ValidValue3>,
    v4: Validator<ValidValue3, ValidValue4>,
    v5: Validator<ValidValue4, ValidValue5>,
): Validator<RawValue, ValidValue5>;

export function all<RawValue, ValidValue>(...validators: Array<Validator<any, any>>): Validator<RawValue, ValidValue> {
    return (value) => {
        let currentResult: ValidationResult<any> = { isValid: true, value };

        for (const validator of validators) {
            const result = validator(value);
            if (!result.isValid) return result;

            currentResult = result;
        }

        return currentResult;
    }
}
