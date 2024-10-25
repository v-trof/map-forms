import { z } from 'zod';

import { currentSignle, validSingle } from './access';
import { WithCurrentValue, WithApproval, WithValidValue } from './domain';
import { input } from './input';

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
