import { extendObservable, observable } from 'mobx';
import { z } from 'zod';

import {
    getCurrentValue,
    getValidValue,
    setApproved,
    setCurrentValue,
    ValidationError,
    zodToValidationError,
} from '../domain';

import { makeSuggestManager, SuggestManager } from './suggestManager';
import { SuggestProvider } from './suggestProvider';

export type Suggest<Z extends z.ZodTypeAny> = {
    readonly value: z.input<Z> | undefined;
    suggest: SuggestManager<z.input<Z> | undefined>;
    onClear: () => void;
    onChange: (newValue: z.input<Z> | undefined) => void;
    [setApproved]: (value: boolean) => void;
    [getCurrentValue]: () => z.input<Z> | undefined;
    [setCurrentValue]: (value: z.input<Z> | undefined) => void;
    [getValidValue]: () => z.infer<Z> | ValidationError;
};

/**
 * A field for picking form a set of preset items profession / pool type / ...
 */
export const suggest = <Schema extends z.ZodTypeAny>(
    schema: Schema,
    provider: SuggestProvider<Suggest<Schema>['value']>
): Suggest<Schema> => {
    const fieldState = observable({
        value: undefined as z.input<Schema> | undefined,
        approved: false,
    });

    const suggestManager = makeSuggestManager<z.input<Schema> | undefined>(
        fieldState,
        provider
    );

    const field = extendObservable(fieldState, {
        suggest: suggestManager,
        onClear: () => {
            field.approved = false;
            suggestManager.setQueryFromValue(undefined);
            field.value = undefined;
        },
        onChange: (newValue: z.input<Schema> | undefined) => {
            field[setCurrentValue](newValue);
        },
        [setApproved]: (value: boolean) => {
            field.approved = value;
        },
        [getCurrentValue]: () => field.value,
        [setCurrentValue]: (newValue: z.input<Schema> | undefined) => {
            suggestManager.setQueryFromValue(newValue);
            field.value = newValue;
            field.approved = true;
        },
        [getValidValue]: () => {
            const result = schema.safeParse(field.value);
            if (result.success) {
                return result.data;
            }

            return zodToValidationError(result.error);
        },
    });

    return field;
};
