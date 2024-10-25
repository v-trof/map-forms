import { z } from 'zod';

import { current, valid } from './access';
import { alt } from './combine';
import { isValidationError } from './domain';
import { input } from './input';
import { submit } from './submit';

test('alt should validate current value', () => {
    const store = alt(
        {
            a: input(z.string().min(1)),
            b: input(z.string().min(1)),
        },
        'a'
    );

    store.options.a.value = 'a';
    store.options.b.value = 'b';
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

    store.options.a.value = 'a';
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

    store.options.a.value = '';
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

    store.options.obj.a.value = 'a';
    store.options.obj.deep.b.value = 'b';
    expect(valid(store)).toEqual({ a: 'a', deep: { b: 'b' } });

    store.currentKey = 'single';
    store.options.single.value = 'single';
    expect(valid(store)).toBe('single');

    store.currentKey = 'obj';
    expect(valid(store)).toEqual({ a: 'a', deep: { b: 'b' } });

    store.options.obj.a.value = undefined;
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

    store.options.obj.a.value = '';
    store.options.obj.deep.b.value = 'workign on it';

    expect(current(store)).toEqual({ a: '', deep: { b: 'workign on it' } });

    store.currentKey = 'single';
    store.options.single.value = 'single';

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

    store.options.a.value = 'a';
    store.options.b.value = 'b';
    submit(store);

    expect(store.options.a.approved).toBe(true);
    expect(store.options.b.approved).toBe(false);

    store.currentKey = 'b';
    submit(store);
    expect(store.options.a.approved).toBe(true);
    expect(store.options.b.approved).toBe(true);

    store.currentKey = 'b';
    store.current.approved = false; // b
    store.currentKey = 'a';
    submit(store);
    expect(store.options.a.approved).toBe(true);
    expect(store.options.b.approved).toBe(false);
});
