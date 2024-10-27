import { action } from 'mobx';

import {
    WithValidValue,
    getValidValue,
    getError,
    isValidationError,
    ValidationError,
    error,
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

export const submitSlice = (currentSlice: unknown) => {
    if (
        typeof currentSlice !== 'object' ||
        !currentSlice ||
        hasIgnore(currentSlice)
    ) {
        return undefined;
    }

    if (hasSubmit(currentSlice)) {
        return currentSlice[doSubmit]();
    }

    if (hasValidValue(currentSlice)) {
        return currentSlice[getValidValue]();
    }

    if (hasCurrentValue(currentSlice)) {
        return currentSlice[getCurrentValue]();
    }

    if (hasError(currentSlice)) {
        return currentSlice[getError]();
    }

    if (Array.isArray(currentSlice)) {
        const arr: unknown[] = currentSlice.map((item) => submitSlice(item));

        if (arr.every((item) => item === undefined)) {
            return undefined;
        }

        return arr;
    }

    let isEmpty = true;
    let isValid = true;
    const newValue: { [key: string]: unknown } = {};

    for (const key in currentSlice) {
        const value = submitSlice(
            currentSlice[key as keyof typeof currentSlice]
        );

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
        return submitSlice(store) as unknown as
            | ExtractValidValue<Store>
            | ValidationError;
    }
);
