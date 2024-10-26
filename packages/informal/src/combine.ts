import { extendObservable } from 'mobx';

import { current, valid } from './access';
import {
    doSubmit,
    getCurrentValue,
    getValidValue,
    WithValidValue,
} from './domain';
import { ExtractValidValue, submit } from './submit';

export type Alt<Options> = WithValidValue<
    ExtractValidValue<Options[keyof Options]>
> &
    Options & {
        current: Options[keyof Options];
        currentKey: keyof Options;
    };

export const alt = <Options extends object>(
    options: Options,
    initial: keyof Options
): Alt<Options> => {
    const store: Alt<Options> = extendObservable(options, {
        _currentKey: initial,
        current: options[initial],
        get currentKey() {
            return this._currentKey;
        },
        set currentKey(key: keyof Options) {
            this._currentKey = key;
            this.current = options[key];
        },
        [doSubmit]: () => {
            return submit(store.current);
        },
        [getValidValue]: () => valid(store.current),
        [getCurrentValue]: () => current(store.current),
    });

    return store;
};

// i don't like the naming though
export const removable = <T>(store: T) =>
    alt(
        {
            store: store,
            removed: undefined,
        },
        'store'
    );
