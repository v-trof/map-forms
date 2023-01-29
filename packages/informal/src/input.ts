import { makeAutoObservable } from 'mobx';

import {
    error,
    getCurrentValue,
    getError,
    getValidValue,
    Input,
    Validator,
} from './domain';

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
            if (store.value === undefined) {
                return error('required');
            }

            if (validator === undefined) {
                return undefined;
            }

            return validator(store.value);
        },
    };

    return makeAutoObservable(store);
};
