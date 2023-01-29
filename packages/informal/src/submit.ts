/* eslint-disable @typescript-eslint/no-explicit-any */
/*
type Empty = undefined | Record<string, undefined>;
type DeepExtractValue<Store> = Store extends NoSubmit
    ? undefined
    : Store extends Removable
    ? DeepExtractValue<Omit<Store, typeof isRemoved>> | undefined
    : Store extends StoreWithValue<infer Value>
    ? Value
    : Store extends StoreWithError
    ? undefined
    : Store extends Array<any>
    ? DeepExtractValue<Store[number]>[] // we can't filter out empty arrs in modern ts :(
    : Store extends object
    ? {
          [K in keyof Store as DeepExtractValue<Store[K]> extends Empty
              ? never
              : K]: DeepExtractValue<Store[K]>;
      }
    : undefined;

export type ExtractValue<Store> = Store extends object
    ? Exclude<DeepExtractValue<Store>, Record<string, undefined>>
    : DeepExtractValue<Store>;
*/

import { action } from 'mobx';

import { $error, ErrorBox, ValidationError, ValueBox } from './domain';

type Empty = undefined | Record<string, undefined>;
type DeepExtractValue<Store> = Store extends ValueBox<infer Value>
    ? Value
    : Store extends ErrorBox
    ? undefined
    : Store extends Array<any>
    ? DeepExtractValue<Store[number]>[] // we can't filter out empty arrs in modern ts :(
    : Store extends object
    ? {
          [K in keyof Store as DeepExtractValue<Store[K]> extends Empty
              ? never
              : K]: DeepExtractValue<Store[K]>;
      }
    : undefined;

export type ExtractValue<Store> = Store extends object
    ? Exclude<DeepExtractValue<Store>, Record<string, undefined>>
    : DeepExtractValue<Store>;

export const $invalidForm = Symbol('@informal/invalidForm');
export type InvalidForm = { [$invalidForm]: true; report?: unknown };
export const invalidForm = (report?: unknown): InvalidForm => {
    if (report) {
        return { [$invalidForm]: true, report };
    }

    return { [$invalidForm]: true };
};

const isError = (store: unknown): store is ValidationError => {
    if (!store || typeof store !== 'object') {
        return false;
    }

    return Object.hasOwn(store, $error);
};

const isValueBox = (store: object): store is ValueBox<unknown> => {
    return Object.hasOwn(store, 'getValid');
};

const isErrorBox = (store: object): store is ErrorBox => {
    return 'error' in store;
};

export const isInvalidForm = (store: unknown): store is InvalidForm => {
    if (!store || typeof store !== 'object') {
        return false;
    }

    return $invalidForm in store;
};

export const reportError = (maybeError: unknown) => {
    if (!isError(maybeError)) {
        return maybeError;
    }

    if (maybeError.params) {
        return invalidForm({
            error: maybeError.message,
            params: maybeError.params,
        });
    }

    return invalidForm({ error: maybeError.message });
};

export const extractValue = (
    store: unknown,
    onValueBox: (store: ValueBox<unknown>) => void
): any => {
    if (typeof store !== 'object' || !store) {
        return undefined;
    }

    if (isValueBox(store)) {
        onValueBox(store);

        const result = store.getValid();

        return reportError(result);
    }

    if (isErrorBox(store)) {
        return reportError(store.error);
    }

    let isEmpty = true;
    let isValid = true;
    const storeObj: any = store;
    const newValue: { [key: string]: unknown } = {};

    for (const key in storeObj) {
        const value = extractValue(storeObj[key], onValueBox);

        if (isInvalidForm(value)) {
            isValid = false;
            newValue[key] = value.report;
            continue;
        }

        if (typeof value !== undefined) {
            isEmpty = false;
            newValue[key] = value;
        }
    }

    if (!isValid) {
        return invalidForm(newValue);
    }

    if (!isEmpty) {
        return newValue;
    }

    return undefined;
};

export const submit = action(
    <Store>(store: Store): ExtractValue<Store> | InvalidForm => {
        return extractValue(store, (valueBox) => (valueBox.approved = true));
    }
);
