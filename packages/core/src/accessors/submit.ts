import { isRemoved, hasGetValue, NoSubmit, Removable, StoreWithValue, shouldSkip, getValue, hasGetError, getError } from "../protocol/accessAnnotations";
import { createAccessContext } from "../protocol/accessContext";
import { error, isError, ValidationError } from "../protocol/error";


export type RemoveEmptyKeys<T extends object> = { [P in keyof T as T[P] extends undefined ? never : P]: T[P] };

export type RemoveEmptyObject<T extends object> = T extends { [key: string]: undefined } ? undefined : T;

export type ExtractValue<Store> = Store extends StoreWithValue<infer Value>
    ? Value
    : Store extends NoSubmit ? undefined
    : Store extends Removable ? ExtractValue<Omit<Store, typeof isRemoved>> | undefined
    : Store extends Array<any> ? Array<ExtractValue<Store[number]>>
    : Store extends object ? RemoveEmptyObject<RemoveEmptyKeys<{ [K in keyof Store]: ExtractValue<Store[K]> }>> : undefined;

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
