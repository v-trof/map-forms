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

import {
    ErrorBox,
    getError,
    getValidValue,
    InvalidForm,
    invalidForm,
    isError,
    isErrorBox,
    isInvalidForm,
    isValidValueBox,
    setApproved,
    ValueBox,
} from './domain';

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

export const maybeReportError = (maybeError: unknown) => {
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

export const extractValue = (store: unknown): any => {
    if (typeof store !== 'object' || !store) {
        return undefined;
    }

    if (isValidValueBox(store)) {
        const result = store[getValidValue]();
        const value = result?.value;

        if (value !== undefined) {
            return value;
        }
    }

    if (isErrorBox(store)) {
        store[setApproved](true);
        return maybeReportError(store[getError]());
    }

    let isEmpty = true;
    let isValid = true;
    const storeObj: any = store;
    const newValue: { [key: string]: unknown } = {};

    for (const key in storeObj) {
        const value = extractValue(storeObj[key]);

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
        return extractValue(store);
    }
);
