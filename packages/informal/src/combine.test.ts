import { z } from 'zod';

import { current, valid } from './access';
import { alt, removable } from './combine';
import { isValidationError, zodToValidationError } from './domain';
import { input } from './input';
import { submit } from './submit';
import { v } from './validators';

test('alt should validate current value', () => {
    const store = alt(
        {
            a: input(v.string().min(1)),
            b: input(v.string().min(1)),
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
            a: input(v.string().min(1)),
            b: input(v.string().min(1)),
            c: input(v.string().min(1)),
        },
        'a'
    );

    store.a.value = 'a';
    expect(valid(store)).toBe('a');
});

test('alt should throw if current key is invalid', () => {
    const store = alt(
        {
            a: input(v.string().min(1)),
            b: input(v.string().min(1)),
        },
        'a'
    );

    store.a.value = '';
    expect(() => valid(store)).toThrow();
});

test('alt errors should not prevent submit from working', () => {
    const store = alt(
        {
            a: input(v.string().min(1)),
            b: input(v.string().min(1)),
        },
        'a'
    );

    const result = submit(store);
    expect(isValidationError(result)).toBe(true);

    const bigStore = alt(
        {
            obj: {
                a: input(v.string().min(1)),
                deep: {
                    b: input(v.string().min(1)),
                },
            },
            single: input(v.string().min(1)),
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
                a: input(v.string().min(1)),
                deep: {
                    b: input(v.string().min(1)),
                },
            },
            single: input(v.string().min(1)),
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
                a: input(v.string().min(1)),
                deep: {
                    b: input(v.string().min(1)),
                },
            },
            single: input(v.string().min(1)),
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
            a: input(v.string().min(1)),
            b: input(v.string().min(1)),
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
        name: input(v.string().min(1)),
        deep: {
            description: removable(input(v.string().min(1))),
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
        field: input(v.string().min(1)),
        deeper: alt(
            {
                obj: {
                    a: input(v.string().min(1)),
                    removeMe: removable(input(v.string().min(1))),
                    deep: {
                        b: input(v.string().min(1)),
                    },
                },
                single: input(v.string().min(1)),
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
        v.string().min(1).safeParse(undefined).error
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
