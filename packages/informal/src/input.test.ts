import { z } from 'zod';

import { currentSignle, validSingle } from './access';
import { WithCurrentValue, WithApproval, WithValidValue } from './domain';
import { input, notEmpty, options } from './input';

test('Types', () => {
    const test: WithValidValue<string> &
        WithApproval &
        WithCurrentValue<string | undefined> = input(z.string());
    expect(test).toBeDefined();
});

test('Supports writing value into an input', () => {
    const login = input(z.string());

    login.value = 'v-trof';

    expect(login.value).toBe('v-trof');
    expect(currentSignle(login)).toBe('v-trof');
    expect(validSingle(login)).toBe('v-trof');

    login.value = 'new-value';
    expect(login.value).toBe('new-value');
    expect(currentSignle(login)).toBe('new-value');
    expect(validSingle(login)).toBe('new-value');

    login.value = undefined;
    expect(login.value).toBe(undefined);
    expect(currentSignle(login)).toBe(undefined);
    expect(validSingle(login, 'fallback')).toBe('fallback');
    expect(() => validSingle(login)).toThrowError();
});

test('Supports optional fields', () => {
    const login = input(z.string().optional());

    login.value = 'v-trof';

    expect(login.value).toBe('v-trof');
    expect(currentSignle(login)).toBe('v-trof');
    expect(validSingle(login)).toBe('v-trof');

    login.value = undefined;
    expect(login.value).toBe(undefined);
    expect(currentSignle(login)).toBe(undefined);
    expect(validSingle(login)).toBe(undefined);
});

const passwordValidator = z
    .string()
    .min(8)
    .max(40)
    .refine(
        (value) => {
            const schemas = [/[A-Z]/, /[a-z]/, /[0-9]/, /[^A-Za-z0-9]/];

            const passed = schemas.filter((schema) => schema.test(value));

            return passed.length >= 3;
        },
        {
            message:
                'Password must contain at least 3 of the following: uppercase letter, lowercase letter, number, special character',
        }
    );

test('Password validation - valid passwords', () => {
    const validPasswords = [
        'Password1!',
        'ValidPass123@',
        'AnotherPass4',
        'Another$Pass4',
    ];

    const invalidPasswords = [
        'short1!', // Too short
        'alllowercase', // No uppercase or special character or number
        'ALLUPPERCASE1', // No lowercase or special character
        'NoSpecialChar', // No special character or number
        'nonumber!',
        'verylongpasswordthatdoescontainalloftherequiredcharacters2$A',
    ];

    validPasswords.forEach((password) => {
        const inputPassword = input(passwordValidator);
        inputPassword.value = password;
        expect(inputPassword.value).toBe(password);
        expect(currentSignle(inputPassword)).toBe(password);
        expect(validSingle(inputPassword)).toBe(password);
    });

    invalidPasswords.forEach((password) => {
        const inputPassword = input(passwordValidator);
        inputPassword.value = password;
        expect(inputPassword.value).toBe(password);
        expect(currentSignle(inputPassword)).toBe(password);
        expect(validSingle(inputPassword, 'fallback')).toBe('fallback');
    });
});

test('supports number input (counter style)', () => {
    const counter = input(notEmpty(z.number().int().min(0).max(1000), 0));

    counter.value = -1;
    expect(counter.value).toBe(-1);
    expect(validSingle(counter, 100)).toBe(100);

    counter.value = 0;
    expect(counter.value).toBe(0);
    expect(validSingle(counter, 100)).toBe(0);

    counter.value = 500;
    expect(counter.value).toBe(500);
    expect(validSingle(counter, 100)).toBe(500);

    // @ts-expect-error the whole point of defined is to have a default value in component / current
    counter.value = undefined;
});

test('supports select with default value', () => {
    const select = input(
        z.union([z.literal('red'), z.literal('green'), z.literal(15)])
    );

    select.value = 'red';
    expect(select.value).toBe('red');

    select.value = 'green';
    expect(select.value).toBe('green');

    select.value = 15;
    expect(select.value).toBe(15);

    // @ts-expect-error values outside of the union are not allowed
    select.value = 'blue';
});

test('options can be used for convinience', () => {
    const select = input(options('red', 'green', 15, 'i am cool'));

    select.value = 'red';
    expect(select.value).toBe('red');

    select.value = 'green';
    expect(select.value).toBe('green');

    select.value = 15;
    expect(select.value).toBe(15);

    // @ts-expect-error values outside of the union are not allowed
    select.value = 'blue';
});

test('select supprots defined', () => {
    const select = input(
        notEmpty(options('red', 'green', 15, 'i am cool'), 'red')
    );

    expect(select.value).toBe('red');

    select.value = 'green';
    expect(select.value).toBe('green');

    select.value = 15;
    expect(select.value).toBe(15);

    // @ts-expect-error values outside of the union are not allowed
    select.value = 'blue';

    // @ts-expect-error undefined is not allowed
    select.value = undefined;
});

test('defined cannot be invalid type', () => {
    // @ts-expect-error invalid type
    input(notEmpty(z.number(), 'five'));

    // @ts-expect-error invalid type
    input(notEmpty(z.string(), 5));

    // @ts-expect-error invalid type
    input(notEmpty(options('red', 'green', 15, 'i am cool'), 'blue'));
});
