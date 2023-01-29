import { Validate } from './contract';

export const lengthRange =
    (min: number, max: number): Validate<string> =>
    (value: string) => {
        return undefined;
    };

export const minLength =
    (min: number): Validate<string> =>
    (value) => {
        return undefined;
    };

export const maxLength =
    (max: number): Validate<string> =>
    (value) => {
        return undefined;
    };

export const all = <T>(...validators: Validate<T>[]) => {
    return undefined;
};
