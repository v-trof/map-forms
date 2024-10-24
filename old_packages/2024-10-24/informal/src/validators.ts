/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { error, Input, Validator } from './domain';

const stub = 0 as any;

// validators
type Get<T> = T | (() => T);

const getValue = <T>(value: T | (() => T)) => {
    if (typeof value === 'function') {
        return (value as () => T)() as T;
    }

    return value;
};

export const all =
    <T>(...validators: Validator<T>[]): Validator<T> =>
    (value) => {
        for (const validator of validators) {
            const maybeError = validator(value);

            if (maybeError) {
                return maybeError;
            }
        }

        return undefined;
    };

export const minLength =
    (min: Get<number>): Validator<string> =>
    (value) => {
        const minValue = getValue(min);

        if (value.length < minValue) {
            return error('minLength', { min: minValue });
        }
    };
export const maxLength =
    (max: Get<number>): Validator<string> =>
    (value) => {
        const maxValue = getValue(max);

        if (value.length > maxValue) {
            return error('maxLength', { max: maxValue });
        }
    };
export const inRange = (
    min: Get<number>,
    max: Get<number>
): Validator<number> => stub;
