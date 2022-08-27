import { ValidationError } from "./error";

export const getValue = Symbol('@informal/getValue'); // this is ment to be called via autoSubmit(store) or valid(store)
export const getError = Symbol('@informal/getError');
export const noSubmit = Symbol('@informal/noSubmit');
export const isRemoved = Symbol('@informal/isRemoved');

export type StoreWithValue<Value> = {
    [getValue]: () => ValidationError | Value;
}

export type StoreWithError = {
    [getError]: () => ValidationError | undefined;
}

export type NoSubmit = {
    [noSubmit]: true;
}

export type Removable = {
    [isRemoved]: boolean;
}

export const hasGetValue = (store: unknown): store is StoreWithValue<any> => {
    if (store && typeof store === 'object' && getValue in store) {
        return true;
    }

    return false;
}

export const hasGetError = (store: unknown): store is StoreWithError => {
    if (store && typeof store === 'object' && getError in store) {
        return true;
    }

    return false;
}

export const shouldSkip = (store: unknown): boolean => {
    if (store && typeof store === 'object' && noSubmit in store && (store as NoSubmit)[noSubmit] === true) {
        return true;
    }

    if (store && typeof store === 'object' && isRemoved in store && (store as Removable)[isRemoved] === true) {
        return true;
    }

    return false;
}

