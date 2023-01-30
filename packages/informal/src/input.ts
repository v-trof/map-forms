import { makeAutoObservable } from 'mobx';

import {
    error,
    getCurrentValue,
    getError,
    getValidValue,
    Input,
    setApproved,
    Validator,
} from './domain';
import { claimReadContext } from './reader/readContext';

export const input = <T>(validator?: Validator<T>): Input<T> => {
    const store: Input<T> = {
        value: undefined,
        approved: false,
        [getCurrentValue]: () => {
            return {
                value: store.value,
                approved: store.approved,
            };
        },
        [getValidValue]: () => {
            if (store[getError]()) {
                return undefined;
            }

            return {
                value: store.value as T,
                approved: store.approved,
            };
        },
        [getError]() {
            let success = true;

            if (store.value === undefined) {
                return error('required');
            }

            if (validator === undefined) {
                return undefined;
            }

            // TODO: in smart mixing consider approvals when depending on other fields
            const dispose = claimReadContext((_, isSuccesful) => {
                success = isSuccesful && success;
            });

            try {
                const maybeError = validator(store.value);

                if (!success) {
                    return maybeError;
                }

                return maybeError;
            } finally {
                dispose();
            }
        },
        [setApproved]() {
            store.approved = true;
        },
    };

    return makeAutoObservable(store);
};
