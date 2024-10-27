import { observable } from 'mobx';

import { ExtractCurrentValue } from './access';
import { autofill } from './autofill';
import { addItem, createItem, setCurrentValue } from './domain';

export type InputArray<Item> = Array<Item> & {
    [addItem]: () => Item;
    [createItem]: () => Item;
    [setCurrentValue]: (value: Array<ExtractCurrentValue<Item>>) => void;
};
export const inputArray = <Item>(
    createNewInput: () => Item
): InputArray<Item> => {
    const array = observable([]) as unknown as InputArray<Item>;
    array[addItem] = () => {
        const item = array[createItem]();
        array.push(item);
        return item;
    };
    array[createItem] = () => {
        return createNewInput();
    };
    array[setCurrentValue] = (value: Array<ExtractCurrentValue<Item>>) => {
        array.length = 0;
        value.forEach((valueItem) => {
            const item = array[addItem]();
            autofill(item, valueItem);
        });
    };
    return array;
};

export type InputRecord<V> = { [key: string]: V } & {
    [addItem]: (key: string) => V;
    [createItem]: () => V;
    [setCurrentValue]: (value: {
        [key: string]: ExtractCurrentValue<V>;
    }) => void;
};

export const inputRecord = <V>(createNewInput: () => V): InputRecord<V> => {
    const record = observable({}) as unknown as InputRecord<V>;
    record[addItem] = (key: string) => {
        record[key] = record[createItem]();
        return record[key];
    };
    record[createItem] = () => {
        return createNewInput();
    };
    record[setCurrentValue] = (
        value: Record<string, ExtractCurrentValue<V>>
    ) => {
        for (const key in record) {
            delete record[key];
        }
        for (const key in value) {
            const item = record[addItem](key);
            autofill(item, value[key]);
        }
    };
    return record;
};

// I really don't like this one, maybe calling addItem directly would be better
export const add = <V>(record: InputRecord<V>, key: string) => {
    return record[addItem](key);
};
