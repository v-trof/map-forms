/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    $noFallback,
    ErrorBox,
    getError,
    getValidValue,
    isErrorBox,
    isValidValueBox,
    ValidValueBox,
} from '../domain';

import { claimReadContext, readContext } from './readContext';

type Empty = undefined | Record<string, undefined>;
type DeepExtractValidValue<Store> = Store extends ValidValueBox<infer Value>
    ? Value
    : Store extends ErrorBox
    ? undefined
    : Store extends Array<any> // TODO: try going for unknown but I am not sure
    ? DeepExtractValidValue<Store[number]>[] // TODO: try supporting tuples
    : Store extends object
    ? {
          [K in keyof Store as DeepExtractValidValue<Store[K]> extends Empty
              ? never
              : K]: DeepExtractValidValue<Store[K]>;
      }
    : undefined;

export type Valid<Store> = Store extends object
    ? Exclude<DeepExtractValidValue<Store>, Record<string, undefined>>
    : DeepExtractValidValue<Store>;

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

const extractValidValue = (store: unknown): any => {
    if (typeof store !== 'object' || !store) {
        return undefined;
    }

    if (isValidValueBox(store)) {
        const result = store[getValidValue]();

        if (result === undefined) {
            readContext.onRead([false], false);
            return undefined;
        } else {
            readContext.onRead([result.approved], true);

            return result.value;
        }
    }

    if (isErrorBox(store)) {
        const maybeError = store[getError]();

        if (maybeError) {
            readContext.onRead([store.approved], false);
            return undefined;
        }
    }

    return mapObject(store, extractValidValue);
};

// TODO: try making this and current share a codebase
export const valid = <Store, Fallback = typeof $noFallback>(
    store: Store,
    // @ts-expect-error techically can be any type, not just $noFallback
    fallback: Fallback = $noFallback
): Fallback extends typeof $noFallback
    ? Valid<Store>
    : Valid<Store> | Fallback => {
    let success = true;
    const approvals: boolean[] = [];

    const dispose = claimReadContext((readApprovals, isSuccesful) => {
        approvals.push(...readApprovals);
        success = isSuccesful && success;
    });

    try {
        const value = extractValidValue(store);

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
        return fallback as any;
    } finally {
        dispose();
    }
};

export const isValid = (store: unknown): boolean => {
    const invalid = {};
    const result = valid(store, invalid);

    if (result === invalid) {
        return false;
    }

    return true;
};
