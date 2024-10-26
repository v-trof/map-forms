import { action } from 'mobx';

import {
    WithValidValue,
    getValidValue,
    getError,
    isValidationError,
    setApproved,
    ValidationError,
    error,
    hasApproval,
    hasValidValue,
    WithCurrentValue,
    Ignored,
    WithSubmit,
    WithError,
    hasSubmit,
    doSubmit,
    hasError,
    hasIgnore,
    hasCurrentValue,
    getCurrentValue,
} from './domain';

export type Empty = undefined | Record<string, undefined>;
type DeepExtractValidValue<Store> = Store extends WithSubmit<infer Value>
    ? Value
    : Store extends WithValidValue<infer Value>
    ? Value
    : Store extends WithCurrentValue<infer Value>
    ? Value
    : Store extends WithError
    ? undefined
    : Store extends Ignored
    ? undefined
    : Store extends Array<unknown>
    ? DeepExtractValidValue<Store[number]>[] // we can't filter out empty arrays in modern ts :(
    : Store extends object
    ? {
          [K in keyof Store as DeepExtractValidValue<Store[K]> extends Empty
              ? never
              : K]: DeepExtractValidValue<Store[K]>;
      }
    : undefined;

export type ExtractValidValue<Store> = Store extends object
    ? Exclude<DeepExtractValidValue<Store>, Record<string, undefined>>
    : DeepExtractValidValue<Store>;

const sumbitErrorMessage = '@informal/submit: invalid form';

export const extractValue = (store: unknown) => {
    if (typeof store !== 'object' || !store || hasIgnore(store)) {
        return undefined;
    }

    if (hasSubmit(store)) {
        return store[doSubmit]();
    }

    if (hasApproval(store)) {
        store[setApproved](true);
    }

    if (hasValidValue(store)) {
        return store[getValidValue]();
    }

    if (hasCurrentValue(store)) {
        return store[getCurrentValue]();
    }

    if (hasError(store)) {
        return store[getError]();
    }

    let isEmpty = true;
    let isValid = true;
    const newValue: { [key: string]: unknown } = {};

    for (const key in store) {
        const value = extractValue(store[key as keyof typeof store]);

        if (isValidationError(value)) {
            isValid = false;
            isEmpty = false;
            newValue[key] =
                value.message === sumbitErrorMessage ? value.params : value;
            continue;
        }

        if (value !== undefined) {
            isEmpty = false;
            newValue[key] = value;
        }
    }

    if (!isValid) {
        return error(sumbitErrorMessage, newValue);
    }

    if (!isEmpty) {
        return newValue;
    }

    return undefined;
};

export const submit = action(
    <Store>(store: Store): ExtractValidValue<Store> | ValidationError => {
        return extractValue(store) as unknown as
            | ExtractValidValue<Store>
            | ValidationError;
    }
);
