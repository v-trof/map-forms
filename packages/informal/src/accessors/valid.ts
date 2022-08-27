import { isError, ValidationError } from "../protocol/error";
import { extractValue, ExtractValue } from "./submit";

export type ValidContext = { onError: (error: ValidationError) => void };

const validContext: ValidContext = { onError: () => 0 }

export const createValidContext = () => {
    let maybeError: ValidationError | undefined;

    const newContext: ValidContext = {
        onError: (error: ValidationError) => {
            maybeError = error;
        }
    };

    const lastContext = { ...validContext };
    Object.assign(validContext, newContext);

    const dispose = () => {
        Object.assign(validContext, lastContext);
    }

    return { dispose, getError: () => maybeError };
}

export const ensureValid = <T>(getValue: () => T) => {
    return () => {
        const { getError, dispose } = createValidContext();

        try {
            const value = getValue();

            if (getError()) {
                return getError();
            }

            return value;
        } catch (error) {
            if (getError() === undefined) {
                // this code can fail when undefined is returned form valid when it shouldn't according to ts
                // in other cases it is definitely an error in the code and we propagate it
                throw error;
            }
        } finally {
            dispose();
        }
    }
}

export const valid = <T>(store: T): ExtractValue<T> => {
    const result = extractValue(store);

    if (isError(result)) {
        validContext.onError(result);
        return undefined as any;
    }

    return result;
}