import { z } from 'zod';

import { current, valid } from './access';
import { alt, transformSubmitValue, removable } from './combine';
import { isValidationError, zodToValidationError } from './domain';
import { Input, input } from './input';
import { add, inputRecord } from './strucureInputs';
import { submit } from './submit';

test('alt should validate current value', () => {
    const store = alt(
        {
            a: input(z.string().min(1)),
            b: input(z.string().min(1)),
        },
        'a'
    );

    store.a.value = 'a';
    store.b.value = 'b';
    expect(valid(store)).toBe('a');

    store.currentKey = 'b';
    expect(valid(store)).toBe('b');
});

test('alt should not validate other options', () => {
    const store = alt(
        {
            a: input(z.string().min(1)),
            b: input(z.string().min(1)),
            c: input(z.string().min(1)),
        },
        'a'
    );

    store.a.value = 'a';
    expect(valid(store)).toBe('a');
});

test('alt should throw if current key is invalid', () => {
    const store = alt(
        {
            a: input(z.string().min(1)),
            b: input(z.string().min(1)),
        },
        'a'
    );

    store.a.value = '';
    expect(() => valid(store)).toThrow();
});

test('alt errors should not prevent submit from working', () => {
    const store = alt(
        {
            a: input(z.string().min(1)),
            b: input(z.string().min(1)),
        },
        'a'
    );

    const result = submit(store);
    expect(isValidationError(result)).toBe(true);

    const bigStore = alt(
        {
            obj: {
                a: input(z.string().min(1)),
                deep: {
                    b: input(z.string().min(1)),
                },
            },
            single: input(z.string().min(1)),
        },
        'obj'
    );
    const result2 = submit(bigStore);
    expect(isValidationError(result2)).toBe(true);
});

test('alt supports deep values', () => {
    const store = alt(
        {
            obj: {
                a: input(z.string().min(1)),
                deep: {
                    b: input(z.string().min(1)),
                },
            },
            single: input(z.string().min(1)),
        },
        'obj'
    );

    store.obj.a.value = 'a';
    store.obj.deep.b.value = 'b';
    expect(valid(store)).toEqual({ a: 'a', deep: { b: 'b' } });

    store.currentKey = 'single';
    store.single.value = 'single';
    expect(valid(store)).toBe('single');

    store.currentKey = 'obj';
    expect(valid(store)).toEqual({ a: 'a', deep: { b: 'b' } });

    store.obj.a.value = undefined;
    expect(() => valid(store)).toThrow();
});

test('supports current value', () => {
    const store = alt(
        {
            obj: {
                a: input(z.string().min(1)),
                deep: {
                    b: input(z.string().min(1)),
                },
            },
            single: input(z.string().min(1)),
        },
        'obj'
    );

    store.obj.a.value = '';
    store.obj.deep.b.value = 'workign on it';

    expect(current(store)).toEqual({ a: '', deep: { b: 'workign on it' } });

    store.currentKey = 'single';
    store.single.value = 'single';

    expect(current(store)).toBe('single');

    store.currentKey = 'obj';
    expect(current(store)).toEqual({ a: '', deep: { b: 'workign on it' } });
});

test('only current options should be approved by submit', () => {
    const store = alt(
        {
            a: input(z.string().min(1)),
            b: input(z.string().min(1)),
        },
        'a'
    );

    store.a.value = 'a';
    store.b.value = 'b';
    submit(store);

    expect(store.a.approved).toBe(true);
    expect(store.b.approved).toBe(false);

    store.currentKey = 'b';
    submit(store);
    expect(store.a.approved).toBe(true);
    expect(store.b.approved).toBe(true);

    store.currentKey = 'b';
    store.current.approved = false; // b
    store.currentKey = 'a';
    submit(store);
    expect(store.a.approved).toBe(true);
    expect(store.b.approved).toBe(false);
});

test('removable is considered undefined when removed', () => {
    const store = {
        name: input(z.string().min(1)),
        deep: {
            description: removable(input(z.string().min(1))),
        },
    };

    store.name.value = 'name';
    store.deep.description.currentKey = 'removed';
    expect(valid(store)).toEqual({ name: 'name' });

    // options as a separate object are meh, can alsways pass them as options
    store.deep.description.currentKey = 'store';
    store.deep.description.store.value = 'description';

    expect(valid(store)).toEqual({
        name: 'name',
        deep: { description: 'description' },
    });
});

test('during submit alt returns a report of all errors', () => {
    const bigStore = {
        field: input(z.string().min(1)),
        deeper: alt(
            {
                obj: {
                    a: input(z.string().min(1)),
                    removeMe: removable(input(z.string().min(1))),
                    deep: {
                        b: input(z.string().min(1)),
                    },
                },
                single: input(z.string().min(1)),
            },
            'obj'
        ),
    };

    bigStore.deeper.obj.removeMe.currentKey = 'removed';

    const result = submit(bigStore);
    expect(isValidationError(result)).toBe(true);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const report = (result as any).params;

    const requiredError = zodToValidationError(
        z.string().min(1).safeParse(undefined).error
    );

    expect(report).toEqual({
        field: requiredError,
        deeper: {
            a: requiredError,
            deep: {
                b: requiredError,
            },
        },
    });

    bigStore.deeper.currentKey = 'single';
    const result2 = submit(bigStore);
    expect(isValidationError(result2)).toBe(true);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const report2 = (result2 as any).params;
    expect(report2).toEqual({
        field: requiredError,
        deeper: requiredError,
    });
});

test('mapSubmitValue can change input value', () => {
    const double = transformSubmitValue(
        input(z.number()),
        (value) => value * 2
    );

    double.value = 10;
    const result = submit(double);
    if (isValidationError(result)) {
        return expect(result).toBe('this should not happen');
    }
    const value: number = result;

    expect(value).toBe(20);
});

test('mapSubmitValue can change form value', () => {
    const store = {
        name: input(z.string()),
        birthday: input(z.date()),
    };

    store.name.value = 'Bob';
    store.birthday.value = new Date(1995, 11, 17);

    function getYearDifference(date1: Date, date2: Date): number {
        const diffInMilliseconds = Math.abs(date2.getTime() - date1.getTime());
        const millisecondsInYear = 1000 * 60 * 60 * 24 * 365.25; // Average year length, accounting for leap years
        return Math.floor(diffInMilliseconds / millisecondsInYear);
    }

    const form = transformSubmitValue(store, (value) => ({
        name: value.name,
        age: getYearDifference(value.birthday, new Date(2024, 10, 20)),
    }));

    const result = submit(form);
    if (isValidationError(result)) {
        return expect(result).toBe('this should not happen');
    }
    const value: { name: string; age: number } = result;

    expect(value).toEqual({ name: 'Bob', age: 28 });
});

test('mapSubmitValue can convert objects into arrays', () => {
    const meta: Record<string, Input<z.ZodString>> = {};

    meta.title = input(z.string());
    meta.ticket = input(z.string());

    meta.title.value = 'Test project';
    meta.ticket.value = 'QUEUE-123';

    const form = transformSubmitValue(meta, (value) =>
        Object.entries(value).map(([key, value]) => ({
            key: key,
            value: [value],
        }))
    );

    const result = submit(form);
    if (isValidationError(result)) {
        return expect(result).toBe('this should not happen');
    }
    const value: Array<{ key: string; value: string[] }> = result;

    expect(value).toEqual([
        { key: 'title', value: ['Test project'] },
        { key: 'ticket', value: ['QUEUE-123'] },
    ]);
});

test('mapSubmitValue can convert inputRecords into arrays', () => {
    const form = transformSubmitValue(
        inputRecord(() => input(z.string())),
        (value) =>
            Object.entries(value).map(([key, value]) => ({
                key: key,
                value: [value],
            }))
    );

    add(form, 'title').value = 'Test project';
    add(form, 'ticket').value = 'QUEUE-123';

    const result = submit(form);
    if (isValidationError(result)) {
        return expect(result).toBe('this should not happen');
    }
    const value: Array<{ key: string; value: string[] }> = result;

    expect(value).toEqual([
        { key: 'title', value: ['Test project'] },
        { key: 'ticket', value: ['QUEUE-123'] },
    ]);
});
