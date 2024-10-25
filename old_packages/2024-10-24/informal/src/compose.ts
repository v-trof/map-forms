/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { ExtractValue, ValidValueBox, getValidValue } from '../informal';

import { Input, Validator } from './domain';

const stub = 0 as any;

export type Alt<Options> = ValidValueBox<ExtractValue<Options[keyof Options]>> &
    Options & {
        current: Options[keyof Options];
        currentKey: keyof Options;
    };

export const alt = <Options extends object>(
    options: Options,
    initial: keyof Options
): Alt<Options> => stub;

export const removable = <T>(store: T) =>
    alt(
        {
            store: store,
            removed: undefined,
        },
        'store'
    );
