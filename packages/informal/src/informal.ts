import { computed, makeAutoObservable } from 'mobx';

import { error, ErrorBox, Input, Validator, ValueBox } from './domain';
import { claimReadContext, readContext } from './readers';

export const input = <T>(validator?: Validator<T>): Input<T> => {
    const store: Input<T> = {
        value: undefined,
        approved: false,
        get error() {
            if (store.value === undefined) {
                return error('required');
            }

            if (validator === undefined) {
                return undefined;
            }

            return validator(store.value);
        },
        getValid: () => {
            if (!store.approved) {
                readContext.reportUnapprovedRead('Not approved', input);
            }

            if (store.error) {
                return store.error;
            }

            return store.value as T;
        },
    };
    return makeAutoObservable(store);
};

export const errorBox = (validator?: Validator<undefined>): ErrorBox => {
    const lastRead = computed(() => {
        if (!validator) {
            return {
                approved: true,
                error: undefined,
            };
        }

        const report = [];

        const { dispose } = claimReadContext((...args) => report.push(args));

        report; // ?

        try {
            const maybeError = validator(undefined);

            if (report.length > 0) {
                return {
                    approved: false,
                    error: maybeError,
                };
            }

            return {
                approved: true,
                error: maybeError,
            };
        } finally {
            dispose();
        }
    });

    const store: ErrorBox = {
        get approved() {
            return lastRead.get().approved;
        },
        get error() {
            return lastRead.get().error;
        },
    };
    return makeAutoObservable(store);
};

export const valueBox = <T>(value: T): ValueBox<T> => {
    const store = {
        approved: true,
        getValid: () => value,
    };

    return makeAutoObservable(store);
};
