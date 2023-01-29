export const $error = Symbol('@informal/error');

export type ValidationError = {
    [$error]: true;
    message: string;
    params?: object;
};

export type Validator<T> = (value: T) => ValidationError | undefined;

export interface ValueBox<T> {
    approved: boolean;
    getValid: () => T | ValidationError;
}

export interface ErrorBox {
    approved: boolean;
    error?: ValidationError;
}

export interface Input<T> extends ValueBox<T>, ErrorBox {
    value: T | undefined;
}

export const error = (message: string, params?: object): ValidationError => {
    if (params) {
        return { [$error]: true, message, params };
    }
    return { [$error]: true, message };
};
