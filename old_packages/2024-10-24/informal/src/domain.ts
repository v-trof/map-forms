export const getValidValue = Symbol('@informal/getValid');
export const getCurrentValue = Symbol('@informal/getValue');
export const getError = Symbol('@informal/getError');
export const setApproved = Symbol('@informal/setApproved');

export const $error = Symbol('@informal/error');
export const error = (message: string, params?: object): ValidationError => {
    if (params) {
        return { [$error]: true, message, params };
    }
    return { [$error]: true, message };
};

export const $invalidForm = Symbol('@informal/invalidForm');
export const invalidForm = (report?: unknown): InvalidForm => {
    if (report) {
        return { [$invalidForm]: true, report };
    }

    return { [$invalidForm]: true };
};

export const $noFallback = Symbol('@informal/noFallback');

export interface ValidationError {
    [$error]: true;
    message: string;
    params?: object;
}

export type InvalidForm = { [$invalidForm]: true; report?: unknown };

export interface CurrentValueBox<Value> {
    [getCurrentValue]: () => { value: Value; approved: boolean } | undefined;
}

export interface ValidValueBox<Value> {
    [getValidValue]: () => { value: Value; approved: boolean } | undefined;
}

export interface ValueBox<Value>
    extends CurrentValueBox<Value>,
        ValidValueBox<Value> {}

export interface ErrorBox {
    approved: boolean;
    [getError]: () => ValidationError | undefined;
    [setApproved]: (approved: boolean) => void;
}

export interface Input<Value>
    extends ErrorBox,
        CurrentValueBox<Value | undefined>,
        ValidValueBox<Value> {
    value: Value | undefined;
}

export type Validator<T> = (value: T) => ValidationError | undefined;

export const isError = (store: unknown): store is ValidationError => {
    if (!store || typeof store !== 'object') {
        return false;
    }

    return Object.hasOwn(store, $error);
};

export const isCurrentValueBox = (
    store: unknown
): store is CurrentValueBox<unknown> => {
    if (!store || typeof store !== 'object') {
        return false;
    }

    return Object.hasOwn(store, getCurrentValue);
};

export const isValidValueBox = (
    store: unknown
): store is ValidValueBox<unknown> => {
    if (!store || typeof store !== 'object') {
        return false;
    }

    return Object.hasOwn(store, getValidValue);
};

export const isErrorBox = (store: unknown): store is ErrorBox => {
    if (!store || typeof store !== 'object') {
        return false;
    }

    return Object.hasOwn(store, getError);
};

export const isInvalidForm = (store: unknown): store is InvalidForm => {
    if (!store || typeof store !== 'object') {
        return false;
    }

    return $invalidForm in store;
};
