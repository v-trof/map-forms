import {
    ExtractValueValid,
    ExtractValueCurrent,
    ExtractValueRaw,
} from './contract';

export const valid = <Store, Fallback = ExtractValueValid<Store>>(
    store: Store,
    fallback?: Fallback
): ExtractValueValid<Store> | Fallback => {
    return store;
};

export const current = <Store, Fallback = ExtractValueCurrent<Store>>(
    store: Store,
    fallback?: Fallback
): ExtractValueCurrent<Store> | Fallback => {
    return store;
};

export const raw = <Store, Fallback = ExtractValueRaw<Store>>(
    store: Store,
    fallback?: Fallback
): ExtractValueRaw<Store> | Fallback => {
    return store;
};
