import { action, observable } from 'mobx';
import { z } from 'zod';

import {
    getCurrentValue,
    getValidValue,
    setApproved,
    ValidationError,
    zodToValidationError,
} from './domain';

export type Input<Z extends z.ZodTypeAny> = {
    value: z.input<Z>;
    approved: boolean;
    [setApproved]: (value: boolean) => void;
    [getCurrentValue]: () => z.input<Z> | undefined;
    [getValidValue]: () => z.infer<Z> | ValidationError;
};

export const input = <Schema extends z.ZodTypeAny>(
    schema: Schema
): Input<Schema> => {
    const store: Input<Schema> = observable({
        value: schema.safeParse(undefined).data,
        approved: false,
        [setApproved]: action((value: boolean) => {
            store.approved = value;
        }),
        [getCurrentValue]: () => store.value,
        [getValidValue]: () => {
            const result = schema.safeParse(store.value);
            if (result.success) {
                return result.data;
            }

            return zodToValidationError(result.error);
        },
    });

    return store;
};
