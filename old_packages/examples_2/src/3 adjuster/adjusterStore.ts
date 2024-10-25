import {
    Field,
    field,
    ensureValid,
    valid,
    getValue,
    ValidationError,
    submit,
    Removable,
    ExtractValue,
} from '@informal/core';
import { makeAutoObservable } from 'mobx';

export type AdjusterValue =
    | {
          type: 'Top%';
          percent: number;
      }
    | {
          type: 'TopN';
          count: number;
      };

export type AdjusterStore = {
    percent: Field<number>;
    count: Field<number>;
    type: 'Top%' | 'TopN';
    [getValue]: () => AdjusterValue | ValidationError;
};

export const createAdjusterStore = () => {
    const store: AdjusterStore = {
        type: 'Top%',
        count: field<number>(),
        percent: field<number>(),
        [getValue]: ensureValid<AdjusterValue>(() => {
            if (store.type === 'Top%') {
                return { type: 'Top%', percent: valid(store.percent) };
            }

            return { type: 'TopN', count: valid(store.count) };
        }),
    };

    return makeAutoObservable(store);
};
