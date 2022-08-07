export type ValidationError = { message: string; params?: any };

export type ValidationResult<Value> =
    | {
        isValid: true;
        value: Value;
    }
    | {
        isValid: false;
        error: ValidationError;
    };

export type Validator<Value> = (
    value: Value
) => ValidationError | undefined;
