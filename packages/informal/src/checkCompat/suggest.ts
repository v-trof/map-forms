import { extendObservable, observable } from 'mobx';
import { z } from 'zod';

import {
    doSubmit,
    getCurrentValue,
    getValidValue,
    setCurrentValue,
    ValidationError,
} from '../domain';
import { validateAgainstZod } from '../input';
import { reportApprovalStatus } from '../validation';

import { makeSuggestManager, SuggestManager } from './suggestManager';
import { SuggestProvider } from './suggestProvider';

export type Suggest<Z extends z.ZodTypeAny> = {
    readonly value: z.input<Z> | undefined;
    suggest: SuggestManager<z.input<Z> | undefined>;
    onClear: () => void;
    onChange: (newValue: z.input<Z> | undefined) => void;
    backendError: ValidationError | undefined;
    [getCurrentValue]: () => z.input<Z> | undefined;
    [setCurrentValue]: (value: z.input<Z> | undefined) => void;
    [getValidValue]: () => z.infer<Z> | ValidationError;
    [doSubmit]: () => z.infer<Z> | ValidationError;
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

    const store = extendObservable(fieldState, {
        suggest: suggestManager,
        backendError: undefined as ValidationError | undefined,
        onClear: () => {
            store.approved = false;
            suggestManager.setQueryFromValue(undefined);
            store.value = undefined;
        },
        onChange: (newValue: z.input<Schema> | undefined) => {
            store[setCurrentValue](newValue);
        },
        [getCurrentValue]: () => {
            reportApprovalStatus(store.approved);
            return store.value;
        },
        [setCurrentValue]: (newValue: z.input<Schema> | undefined) => {
            suggestManager.setQueryFromValue(newValue);
            store.value = newValue;
            store.approved = true;
        },
        [getValidValue]: () => {
            if (store.backendError) {
                return store.backendError;
            }
            return validateAgainstZod(schema, store.value, store.approved);
        },
        [doSubmit]: () => {
            store.backendError = undefined;
            return store[getValidValue]();
        },
    });

    return store;
};
