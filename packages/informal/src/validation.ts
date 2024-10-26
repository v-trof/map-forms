import { action, observable } from 'mobx';
import { z } from 'zod';

import {
    doSubmit,
    getError,
    isValidationError,
    setApproved,
    ValidationError,
    WithApproval,
    WithError,
    WithSubmit,
    zodToValidationError,
} from './domain';

export type Validation = WithApproval & WithError;

export const validation = (
    validator: () => ValidationError | undefined
): Validation => {
    const store: Validation = observable({
        approved: false,
        [setApproved]: action((value: boolean) => {
            store.approved = value;
        }),
        [getError]: () => {
            try {
                return validator();
            } catch (e) {
                if (isValidationError(e)) {
                    return e;
                }
                throw e;
            }
        },
    });

    return store;
};

export const validationZod = <Schema extends z.ZodTypeAny>(
    schema: Schema
): Validation => {
    const store: Validation = observable({
        approved: false,
        [setApproved]: action((value: boolean) => {
            store.approved = value;
        }),
        [getError]: () => {
            const result = schema.safeParse(undefined);

            if (result.success) {
                return undefined;
            }

            return zodToValidationError(result.error);
        },
    });

    return store;
};

export type ValidationBackend = Validation & {
    setError: (backendError: ValidationError | undefined) => void;
} & WithSubmit<void>;

export const ValidationBackend = (): ValidationBackend => {
    const store = observable({
        error: undefined as ValidationError | undefined,
        approved: false,
        [setApproved]: action((value: boolean) => {
            store.approved = value;
        }),
        setError: action((backendError: ValidationError | undefined) => {
            store.error = backendError;
            store.approved = true;
        }),
        [doSubmit]: () => {
            store.error = undefined;
            store.approved = false;
        },
        [getError]: () => store.error,
    });

    return store;
};
