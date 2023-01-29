/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { error, Input, ValidationError, Validator } from './domain';

const stub = 0 as any;

export type Parser<S, T> = {
    stateToValue: (state: S) => T | ValidationError;
    valueToState: (value: T) => S;
};
export interface ParsedInput<S, T> extends Input<T> {
    state: S;
}

export const parsed = <S, T>(
    parser: Parser<S, T>,
    validator?: Validator<T>,
    options?: {
        stateValidator: Validator<S>;
    }
): Input<T> => stub;

export const state = <S>(input: ParsedInput<S, unknown>): S => stub; // I feel this isn't necessary

export const number: Parser<string, number> = {
    stateToValue: (str) => {
        try {
            str = str.replace(',', '.');
            return parseFloat(str);
        } catch (err) {
            return error('Please input a number, this is impossible to parse');
        }
    },
    valueToState: (num) => String(num),
};
