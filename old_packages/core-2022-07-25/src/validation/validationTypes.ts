export type ValidationError = { code: string; params?: any };

export type ValidationResult<Value> =
    | {
        isValid: true;
        value: Value;
    }
    | {
        isValid: false;
        error: ValidationError;
    };

export type Validator<RawValue, ValidValue = RawValue> = (
    value: RawValue
) => ValidationResult<ValidValue>;
