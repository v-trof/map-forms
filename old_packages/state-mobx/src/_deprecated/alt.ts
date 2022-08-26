import { makeAutoObservable } from "mobx";
import { autoSubmit, ExtractValues, submit } from "../submit";

type Entry<O extends object> = { [K in keyof O]: { key: K, value: ExtractValues<O[K]> } }[keyof O];

type AltOptions<Options extends object, Value = ExtractValues<Options[keyof Options]>> = {
    options: Options,
    initialChosen: keyof Options,
    getValue?: (chosen: Entry<Options>) => Value;
}

export const alt = <Options extends object, Value>(options: AltOptions<Options, Value>) => {
    const store = makeAutoObservable({
        chosen: options.initialChosen,
        options: options.options,
        get current() {
            return store.options[store.chosen];
        },
        [submit]: () => {
            const result = autoSubmit(store.current)

            if (!result.isValid) {
                return result;
            }

            const entry = { key: store.chosen, value: result.value }

            return {
                isValid: true,
                value: options.getValue ? options.getValue(entry) : result.value
            }
        }
    })
}

/*
export type AdjusterValue = {
    type: 'Top%';
    percent: number;
} | {
    type: 'TopN';
    count: number;
}

import { field } from "../field";

export const createAdjusterStoreAlt = () => {
    const store = alt({
        options: {
            'Top%': field<number>(),
            'TopN': field<number>(),
        },
        initialChosen: 'Top%',
        getValue: (chosen): AdjusterValue => {
            if (chosen.key === 'Top%') {
                return {
                    type: 'Top%',
                    percent: chosen.value
                }
            }

            return {
                type: 'TopN',
                count: chosen.value
            }
        }
    })

    return store;
}
*/