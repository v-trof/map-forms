import { isRemoved, hasGetValue, NoSubmit, Removable, StoreWithValue, shouldSkip, getValue, hasGetError, getError, StoreWithError } from "../protocol/accessAnnotations";
import { createAccessContext } from "../protocol/accessContext";
import { error, isError, ValidationError } from "../protocol/error";

// this exact implementation esures the most ts ide hint / error firendly solution

type Empty = undefined | Record<string, undefined>;
type DeepExtractValue<Store> = 
    | Store extends NoSubmit ? undefined
    : Store extends Removable ? DeepExtractValue<Omit<Store, typeof isRemoved>> | undefined
    : Store extends StoreWithValue<infer Value> ? Value
    : Store extends StoreWithError ? undefined
    : Store extends Array<any> ? DeepExtractValue<Store[number]>[] // we can't filter out empty arrs in modern ts :(
    : Store extends object ? { [K in keyof Store as DeepExtractValue<Store[K]> extends Empty ? never : K]: DeepExtractValue<Store[K]> } : undefined;

export type ExtractValue<Store> = Store extends object ? Exclude<DeepExtractValue<Store>, Record<string, undefined>> : DeepExtractValue<Store>;

export type Submit<Store> = (state: Store) => ValidationError | ExtractValue<Store>;

const tryExtractValue = (store: unknown): unknown => {
    if (shouldSkip(store)) {
        return undefined;
    }

    if (hasGetValue(store)) {
        return store[getValue]();
    }

    if (hasGetError(store)) {
        return store[getError]();
    }

    if (Array.isArray(store)) {
        const result = [] as any;
        let badResult: ValidationError | undefined;

        for (const item of store) {
            const itemResult = tryExtractValue(item);
            if (isError(itemResult)) {
                badResult = itemResult;
            }

            result.push(itemResult);
        }

        if (badResult) {
            return badResult;
        }

        return result;
    }

    if (store && typeof store === 'object') {
        const result = {} as any;
        let badResult: ValidationError | undefined;

        for (const key in store) {
            const itemResult = tryExtractValue((store as any)[key]);
            if (isError(itemResult)) {
                badResult = itemResult;
            } else if (itemResult) {
                result[key] = itemResult;
            }
        }

        if (badResult) {
            return badResult;
        }

        if (Object.keys(result.length > 0)) {
            return result;
        }
    }

    return undefined;
}

export const extractValue = <State>(state: State): ExtractValue<State> | ValidationError => {
    const result = tryExtractValue(state) as ExtractValue<State> | ValidationError | undefined;

    if (!result) {
        console.error("No fields in accessed state", state);
        return error("No fields in state");
    }

    return result;
}

export const submit = <State>(state: State): ExtractValue<State> | ValidationError => {
    const releaseAccessContext = createAccessContext('submit');

    try {
        return extractValue(state);
    } finally {
        releaseAccessContext();
    }
}
