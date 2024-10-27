import { z } from 'zod';

export const getValidValue = Symbol('@informal/getValidValue');
export const getCurrentValue = Symbol('@informal/getCurrentValue');
export const setCurrentValue = Symbol('@informal/setCurrentValue');
export const getError = Symbol('@informal/getError');
export const setApproved = Symbol('@informal/setApproved');
export const doSubmit = Symbol('@informal/doSubmit');
export const informalIgnore = Symbol('@informal/ignore');
export const addItem = Symbol('@informal/addItem');
export const createItem = Symbol('@informal/createItem');

export const $error = Symbol('@informal/error');
export const error = (
    message: string,
    params?: object,
    blocksSubmit = false
): ValidationError => {
    if (params) {
        return { [$error]: true, message, params, blocksSubmit };
    }
    return { [$error]: true, message, blocksSubmit };
};
export const $noFallback = Symbol('@informal/noFallback');

export interface ValidationError {
    [$error]: true;
    message: string;
    params?: object;
    blocksSubmit: boolean;
}

export interface WithCurrentValue<Value> {
    [getCurrentValue]: () => Value | ValidationError;
}

export interface WithSetCurrentValue<Value> {
    [setCurrentValue]: (value: Value) => void;
}

export interface WithValidValue<Value> {
    [getValidValue]: () => Value | ValidationError;
}

export interface WithApproval {
    approved: boolean;
    [setApproved]: (approved: boolean) => void;
}

export interface WithSubmit<Value> {
    [doSubmit]: () => Value | ValidationError;
}

export interface WithError {
    [getError]: () => ValidationError | undefined;
}

export interface Ignored {
    [informalIgnore]: boolean;
}

export const isValidationError = (store: unknown): store is ValidationError => {
    if (!store || typeof store !== 'object') {
        return false;
    }

    return Object.hasOwn(store, $error);
};

export const hasCurrentValue = (
    store: unknown
): store is WithCurrentValue<unknown> => {
    if (!store || typeof store !== 'object') {
        return false;
    }

    return (
        Object.hasOwn(store, getCurrentValue) &&
        (store as WithCurrentValue<unknown>)[getCurrentValue] !== undefined
    );
};

export const hasSetCurrentValue = (
    store: unknown
): store is WithSetCurrentValue<unknown> => {
    if (!store || typeof store !== 'object') {
        return false;
    }

    return (
        Object.hasOwn(store, setCurrentValue) &&
        (store as WithSetCurrentValue<unknown>)[setCurrentValue] !== undefined
    );
};

export const hasValidValue = (
    store: unknown
): store is WithValidValue<unknown> => {
    if (!store || typeof store !== 'object') {
        return false;
    }

    return (
        Object.hasOwn(store, getValidValue) &&
        (store as WithValidValue<unknown>)[getValidValue] !== undefined
    );
};

export const hasApproval = (store: unknown): store is WithApproval => {
    if (!store || typeof store !== 'object') {
        return false;
    }

    return (
        Object.hasOwn(store, setApproved) &&
        (store as WithApproval)[setApproved] !== undefined
    );
};

export const hasSubmit = (store: unknown): store is WithSubmit<unknown> => {
    if (!store || typeof store !== 'object') {
        return false;
    }

    return (
        Object.hasOwn(store, doSubmit) &&
        (store as WithSubmit<unknown>)[doSubmit] !== undefined
    );
};

export const hasError = (store: unknown): store is WithError => {
    if (!store || typeof store !== 'object') {
        return false;
    }

    return (
        Object.hasOwn(store, getError) &&
        (store as WithError)[getError] !== undefined
    );
};

export const hasIgnore = (store: unknown): store is Ignored => {
    if (!store || typeof store !== 'object') {
        return false;
    }

    return (
        Object.hasOwn(store, informalIgnore) &&
        (store as Ignored)[informalIgnore] !== undefined
    );
};

export const zodToValidationError = (
    zodError?: z.ZodError
): ValidationError | undefined => {
    if (!zodError) {
        return undefined;
    }

    const params: z.ZodIssue & { fullError: z.ZodError } = {
        ...zodError.issues[0],
        fullError: zodError,
    };

    return error(zodError.issues[0].message, params);
};
