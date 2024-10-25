import * as z from 'zod';

import { valid, validSingle } from './access';
import { error } from './domain';
import { input } from './input';
import { validation } from './validation';

test('validSingle throws if value is not valid and returns it if it is', () => {
    const store = input(z.number().int().min(0).max(1000));
    store.value = -1;
    expect(() => validSingle(store)).toThrow();

    store.value = 1001;
    expect(() => validSingle(store)).toThrow();

    store.value = undefined;
    expect(() => validSingle(store)).toThrow();

    store.value = 0;
    expect(validSingle(store)).toBe(0);

    store.value = 500;
    expect(validSingle(store)).toBe(500);
});

test('validSingle supports fallback', () => {
    const store = input(z.number().int().min(0).max(1000));
    store.value = -1;
    expect(validSingle(store, 100)).toBe(100);

    store.value = 1001;
    expect(validSingle(store, 100)).toBe(100);

    store.value = undefined;
    expect(validSingle(store, 100)).toBe(100);

    store.value = 0;
    expect(validSingle(store, 100)).toBe(0);

    store.value = 500;
    expect(validSingle(store, 100)).toBe(500);
});

test('valid throws if value is not valid and returns it if it is', () => {
    const store = input(z.number().int().min(0).max(1000));
    store.value = -1;
    expect(() => valid(store)).toThrow();

    store.value = 1001;
    expect(() => valid(store)).toThrow();

    store.value = undefined;
    expect(() => valid(store)).toThrow();

    store.value = 0;
    expect(valid(store)).toBe(0);

    store.value = 500;
    expect(valid(store)).toBe(500);
});

test('valid supports deep values', () => {
    const store = {
        age: input(z.number().int().min(0)),
        balance: input(z.number()),
    };
    store.age.value = 16;
    store.balance.value = 500;
    expect(valid(store)).toEqual({ age: 16, balance: 500 });

    store.age.value = undefined;
    expect(() => valid(store)).toThrow();
});

test('valid supports fallback', () => {
    const store = {
        age: input(z.number().int().min(0)),
        balance: input(z.number()),
    };

    store.age.value = -1;
    store.balance.value = 300;

    expect(valid(store, { age: 100, balance: 100 })).toEqual({
        age: 100,
        balance: 100,
    });
});

test('valid fails if fields are ok, but validation fails', () => {
    const store = {
        password: input(z.string().min(8).max(40)),
        repeatPassword: input(z.string().min(8).max(40)),
        notSame: validation(() => {
            if (valid(store.password) !== valid(store.repeatPassword)) {
                return error('Passwords do not match');
            }
        }),
    };

    store.password.value = 'password';
    store.repeatPassword.value = 'different password';

    expect(() => valid(store)).toThrow();
});

test('valid does not affect approval', () => {
    const store = {
        password: input(z.string().min(8).max(40)),
        repeatPassword: input(z.string().min(8).max(40)),
        notSame: validation(() => {
            if (valid(store.password) !== valid(store.repeatPassword)) {
                return error('Passwords do not match');
            }
        }),
    };

    store.password.value = 'password';
    store.password.approved = true;
    store.repeatPassword.value = 'different password';
    store.repeatPassword.approved = false;

    expect(() => valid(store)).toThrow();
    expect(store.password.approved).toBe(true);
    expect(store.repeatPassword.approved).toBe(false);
});
