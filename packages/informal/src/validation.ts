const validationError = Symbol('validationError');

export type Invalid = {
    [validationError]: true;
    message: string;
    params?: object;
};

export type ExternalError = {
    key: unknown;
    error: Invalid;
};

export type Validate<Value> = (
    value: Value,
    externalErrors: ExternalError[]
) => Invalid | undefined;

export const invalid = (message: string, params?: object) => {
    const errorObject: Invalid = {
        [validationError]: true,
        message,
    };

    if (typeof params !== undefined) {
        errorObject.params = params;
    }

    return errorObject;
};

export const isInvalid = (store: unknown): store is Invalid => {
    if (
        store &&
        typeof store === 'object' &&
        validationError in store &&
        (store as Invalid)[validationError] === true
    ) {
        return true;
    }

    return false;
};

export const minLength = (min: number): Validate<string> => {
    return (value: string) => {
        if (value.length < min) {
            return invalid('minLength', { min });
        }
    };
};

export const maxLength = (max: number): Validate<string> => {
    return (value: string) => {
        if (value.length > max) {
            return invalid('maxLength', { max });
        }
    };
};

export const min = (min: number): Validate<number> => {
    return (value) => {
        if (value < min) {
            return invalid('min', { min });
        }
    };
};

export const max = (max: number): Validate<number> => {
    return (value) => {
        if (value > max) {
            return invalid('max', { max });
        }
    };
};

export function all<Value>(...validators: Validate<Value>[]): Validate<Value> {
    return (value, externalErrors) => {
        for (const validator of validators) {
            const invalid = validator(value, externalErrors);

            if (invalid) {
                return invalid;
            }
        }

        return undefined;
    };
}

export const backend: Validate<unknown> = (_, externalErrors) => {
    return externalErrors.find((item) => item.key === backend)?.error;
};
export const parsing: Validate<unknown> = (_, externalErrors) => {
    return externalErrors.find((item) => item.key === parsing)?.error;
};

export const required = (value: unknown) => {
    if (value === undefined) {
        return invalid('required');
    }
};
