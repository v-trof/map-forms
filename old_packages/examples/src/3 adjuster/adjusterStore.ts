import {
    autoSubmit,
    ensureValid,
    Field,
    field,
    minValue,
    modifySubmit,
    modifyValid,
    submit,
    valid,
    ValidationResult,
} from '@informal/state-mobx';
import { Submittable } from '@informal/state-mobx/src/submit';
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
    [submit]: () => ValidationResult<AdjusterValue>;
};

export type AdjusterStoreAmp = Submittable<AdjusterValue> & {
    percent: Field<number>;
    count: Field<number>;
    type: 'Top%' | 'TopN';
};

export const createAdjusterStore = () => {
    const store: AdjusterStore = makeAutoObservable({
        type: 'Top%',
        count: field<number>(),
        percent: field<number>(),
        [submit]: () => {
            // too much code & not 100% intuitive but good enough for an edge case
            if (store.type === 'Top%') {
                const percentResult = autoSubmit(store.percent);

                if (percentResult.isValid) {
                    return {
                        isValid: true,
                        value: { type: 'Top%', percent: percentResult.value },
                    };
                }
            }

            if (store.type === 'TopN') {
                const countResult = autoSubmit(store.count);

                if (countResult.isValid) {
                    return {
                        isValid: true,
                        value: { type: 'TopN', count: countResult.value },
                    };
                }
            }

            // todo: consider no submit error since it is not actinable anyway
            return { isValid: false, error: { message: '' } };
        },
    });

    return store;
};

export const createAdjusterStoreValid = () => {
    const store: AdjusterStore = makeAutoObservable({
        type: 'Top%',
        count: field<number>(),
        percent: field<number>(),
        [submit]: ensureValid<AdjusterValue>(() => {
            if (store.type === 'Top%') {
                return { type: 'Top%', percent: valid(store.percent) };
            }

            return { type: 'TopN', count: valid(store.count) };
        }),
    });

    return store;
};

export const createAdjusterStoreModifyValid = () => {
    const store: AdjusterStore = makeAutoObservable({
        type: 'Top%',
        count: field<number>(),
        percent: field<number>(),
        [submit]: () => {
            if (store.type === 'Top%') {
                return modifyValid(
                    autoSubmit(store.percent),
                    (percent): AdjusterValue => ({ type: 'Top%', percent })
                );
            }

            return modifyValid(autoSubmit(store.count), (count) => ({
                type: 'TopN',
                count,
            }));
        },
    });

    return store;
};

export const createAdjusterStoreModifySubmit = () => {
    const store: AdjusterStore = {
        type: 'Top%',
        count: field(minValue(1)),
        percent: field(),
        [submit]: () => {
            if (store.type === 'Top%') {
                return modifySubmit(
                    store.percent,
                    (percent): AdjusterValue => ({ type: 'Top%', percent })
                );
            }

            return modifySubmit(store.count, (count) => ({
                type: 'TopN',
                count,
            }));
        },
    };

    return makeAutoObservable(store);
};
