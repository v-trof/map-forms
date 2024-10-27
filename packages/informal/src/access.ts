import {
    $noFallback,
    ValidationError,
    WithCurrentValue,
    WithValidValue,
    WithApproval,
    getCurrentValue,
    getError,
    getValidValue,
    hasCurrentValue,
    hasValidValue,
    isValidationError,
    hasError,
} from './domain';
import { Empty, ExtractValidValue } from './submit';

const returnFallbackOrThrow = <T>(
    error: unknown,
    fallback: T | typeof $noFallback
) => {
    if (isValidationError(error) && fallback !== $noFallback) {
        return fallback;
    }
    throw error;
};

export const currentSignle = <T>(
    _input: WithCurrentValue<T>,
    fallback: T | typeof $noFallback = $noFallback
): T => {
    const result = _input[getCurrentValue]();
    if (isValidationError(result)) {
        return returnFallbackOrThrow(result, fallback);
    }

    return result;
};

export const validSingle = <T>(
    _input: WithValidValue<T>,
    fallback: T | typeof $noFallback = $noFallback
): T => {
    const result = _input[getValidValue]();

    if (isValidationError(result)) {
        return returnFallbackOrThrow(result, fallback);
    }

    return result;
};

const nothing = Symbol('nothing');

export const extractDeep = (
    currentSlice: unknown,
    tryProcessing: (currentSlice: unknown) => unknown | typeof nothing
): unknown => {
    if (typeof currentSlice !== 'object' || !currentSlice) {
        return undefined;
    }

    const processingResult = tryProcessing(currentSlice);

    // [store, processingResult]; //?
    if (processingResult !== nothing) {
        return processingResult;
    }

    if (Array.isArray(currentSlice)) {
        return currentSlice.map((item) => extractDeep(item, tryProcessing));
    }

    let isEmpty = true;
    const newValue: { [key: string]: unknown } = {};

    for (const key in currentSlice) {
        const value = extractDeep(
            currentSlice[key as keyof typeof currentSlice],
            tryProcessing
        );

        if (isValidationError(value)) {
            throw value;
        }

        if (value !== undefined) {
            isEmpty = false;
            newValue[key] = value;
        }
    }

    // [currentSlice, newValue, isEmpty]; //?
    if (!isEmpty) {
        return newValue;
    }

    return undefined;
};

export const valid = <Store>(
    store: Store,
    fallback: ExtractValidValue<Store> | typeof $noFallback = $noFallback
): ExtractValidValue<Store> => {
    try {
        return extractDeep(store, (currentSlice) => {
            if (hasValidValue(currentSlice)) {
                return validSingle(currentSlice);
            }

            if (hasCurrentValue(currentSlice)) {
                return currentSignle(currentSlice);
            }

            if (hasError(currentSlice)) {
                return currentSlice[getError]();
            }

            return nothing;
        }) as ExtractValidValue<Store>;
    } catch (error) {
        return returnFallbackOrThrow(error, fallback);
    }
};

type DeepExtractCurrentValue<Store> = Store extends WithValidValue<infer Value>
    ? Value
    : Store extends WithApproval
    ? undefined
    : Store extends Array<unknown>
    ? DeepExtractCurrentValue<Store[number]>[] // we can't filter out empty arrays in modern ts :(
    : Store extends object
    ? {
          [K in keyof Store as DeepExtractCurrentValue<Store[K]> extends Empty
              ? never
              : K]: DeepExtractCurrentValue<Store[K]>;
      }
    : undefined;

export type ExtractCurrentValue<Store> = Store extends object
    ? Exclude<DeepExtractCurrentValue<Store>, Record<string, undefined>>
    : DeepExtractCurrentValue<Store>;

export const current = <Store>(
    store: Store,
    fallback: ExtractCurrentValue<Store> | typeof $noFallback = $noFallback
): ExtractCurrentValue<Store> => {
    try {
        return extractDeep(store, (currentSlice) => {
            // TODO: consider extracting valid value as well
            if (hasCurrentValue(currentSlice)) {
                return currentSignle(currentSlice);
            }

            return nothing;
        }) as ExtractCurrentValue<Store>;
    } catch (error) {
        return returnFallbackOrThrow(error, fallback);
    }
};

const _extractError = (currentSlice: unknown): ValidationError | undefined => {
    if (typeof currentSlice !== 'object' || !currentSlice) {
        return undefined;
    }

    if (hasError(currentSlice)) {
        return currentSlice[getError]();
    }

    if (hasValidValue(currentSlice)) {
        const result = currentSlice[getValidValue]();
        if (isValidationError(result)) {
            return result;
        }
    }

    if (hasCurrentValue(currentSlice)) {
        const result = currentSlice[getCurrentValue]();
        if (isValidationError(result)) {
            return result;
        }
    }

    if (Array.isArray(currentSlice)) {
        return currentSlice.find((item) => extractError(item));
    }

    for (const key in currentSlice) {
        const result = extractError(
            currentSlice[key as keyof typeof currentSlice]
        );
        if (result) {
            return result;
        }
    }

    return undefined;
};

export const extractError = <Store>(
    store: Store
): ValidationError | undefined => _extractError(store);
