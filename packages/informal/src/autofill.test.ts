import { z } from 'zod';

import { autofill } from './autofill';
import { Input, input } from './input';
import { inputArray, inputRecord } from './strucureInputs';
import { submit } from './submit';

test('audofill can fill a single input', () => {
    const store = input(z.string().min(1));
    autofill(store, 'hello');
    expect(store.value).toBe('hello');
});

test('autofill can fill a form', () => {
    const store = {
        a: input(z.string().min(1)),
        b: input(z.number().int().min(0)),
    };
    autofill(store, { a: 'hello', b: 10 });
    expect(store.a.value).toBe('hello');
    expect(store.b.value).toBe(10);
});

test('autofill can fill a nested form', () => {
    const store = {
        a: input(z.string().min(1)),
        b: {
            c: input(z.number().int().min(0)),
        },
    };
    autofill(store, { a: 'hello', b: { c: 10 } });
    expect(store.a.value).toBe('hello');
    expect(store.b.c.value).toBe(10);
});

test('autofill can fill pre-created arrays', () => {
    const initialValue = { a: 'hello', b: 10, tags: ['a', 'b', 'c'] };
    const store = {
        a: input(z.string().min(1)),
        b: input(z.number().int().min(0)),
        tags: [] as Input<z.ZodString>[],
    };

    initialValue.tags.forEach(() => {
        store.tags.push(input(z.string().min(1)));
    });

    autofill(store, initialValue); // i don't exactly like this design but it is ok for now
    const result = submit(store);
    expect(result).toEqual(initialValue);
});

test('autofill can fill input arrays', () => {
    const initialValue = { a: 'hello', b: 10, tags: ['a', 'b', 'c'] };
    const store = {
        a: input(z.string().min(1)),
        b: input(z.number().int().min(0)),
        tags: inputArray(() => input(z.string().min(1))),
    };

    autofill(store, initialValue);
    const result = submit(store);
    expect(result).toEqual(initialValue);
});

test('autofill can inputRecord', () => {
    const initialValue = { ticket: 'QUEUE-123', author: 'ME' };
    const store = inputRecord(() => input(z.string().min(1)));

    autofill(store, initialValue);
    const result = submit(store);
    expect(result).toEqual(initialValue);
});
