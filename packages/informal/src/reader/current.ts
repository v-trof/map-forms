/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    $noFallback,
    CurrentValueBox,
    ErrorBox,
    getCurrentValue,
    isCurrentValueBox,
    isErrorBox,
} from '../domain';

import { claimReadContext, readContext } from './readContext';

type Empty = undefined | Record<string, undefined>;
type DeepExtractCurrentValue<Store> = Store extends CurrentValueBox<infer Value>
    ? Value
    : Store extends ErrorBox
    ? undefined
    : Store extends Array<any> // TODO: try going for unknown but I am not sure
    ? DeepExtractCurrentValue<Store[number]>[] // TODO: try supporting tuples
    : Store extends object
    ? {
          [K in keyof Store as DeepExtractCurrentValue<Store[K]> extends Empty
              ? never
              : K]: DeepExtractCurrentValue<Store[K]>;
      }
    : undefined;

export type Current<Store> = Store extends object
    ? Exclude<DeepExtractCurrentValue<Store>, Record<string, undefined>>
    : DeepExtractCurrentValue<Store>;

const mapObject = (store: object, mapProp: (value: unknown) => any) => {
    let isEmpty = true;
    const storeObj: any = store;
    const newValue: any = {};

    for (const key in storeObj) {
        const value = mapProp(storeObj[key]);

        if (typeof value !== undefined) {
            isEmpty = false;
            newValue[key] = value;
        }
    }

    if (!isEmpty) {
        return newValue;
    }

    return undefined;
};

const extractCurrentValue = (store: unknown): any => {
    if (typeof store !== 'object' || !store) {
        return undefined;
    }

    if (isCurrentValueBox(store)) {
        const result = store[getCurrentValue]();

        if (result === undefined) {
            readContext.onRead([false], false);
            return undefined;
        } else {
            readContext.onRead([result.approved], true);

            return result.value;
        }
    }

    if (isErrorBox(store)) {
        return undefined;
    }

    return mapObject(store, extractCurrentValue);
};

export const current = <Store, Fallback = typeof $noFallback>(
    store: Store,
    // @ts-expect-error techically can be any type, not just $noFallback
    fallback: Fallback = $noFallback
): Fallback extends typeof $noFallback
    ? Current<Store>
    : Current<Store> | Fallback => {
    let success = true;
    const approvals: boolean[] = [];

    const dispose = claimReadContext((readApprovals, isSuccesful) => {
        approvals.push(...readApprovals);
        success = isSuccesful && success;
    });

    try {
        const value = extractCurrentValue(store);

        dispose();

        if (success) {
            readContext.onRead(approvals, true);
            return value;
        }

        if (fallback === $noFallback) {
            readContext.onRead(approvals, false);
            return fallback as any;
        }

        readContext.onRead(approvals, true);

        // TODO: consider using a fallback if the value is undefined (since this is a supper common use case)
        // but what would people do if they would like price to be 5 if unparsed, but undefined if actually empty
        return fallback as any;
    } finally {
        dispose();
    }
};
