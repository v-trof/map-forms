export const validationError = Symbol('@informal/error');

export type ValidationError = { [validationError]: true, message: string; params?: any };
export type Validator<Value> = (value: Value) => ValidationError | undefined;

export const error = (message: string, params?: any) => {
    const errorObject: ValidationError = {
        [validationError]: true,
        message
    }

    if (typeof params !== undefined) {
        errorObject.params = params;
    }

    return errorObject;
}

export const isError = (store: unknown): store is ValidationError => {
    if (store && typeof store === 'object' && validationError in store && (store as ValidationError)[validationError] === true) {
        return true;
    }

    return false;
};