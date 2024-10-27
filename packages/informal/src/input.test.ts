import { z } from 'zod';

import { current, currentSignle, valid, validSingle } from './access';
import {
    WithCurrentValue,
    WithApproval,
    WithValidValue,
    error,
    isValidationError,
} from './domain';
import { input, notEmpty, options, ParsedInput, parsedInput } from './input';
import { submit } from './submit';

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

    select.value = 15;
    expect(select.value).toBe(15);

    select.value = 'green';
    expect(select.value).toBe('green');
    expect(validSingle(select)).toBe('green');

    const submitted = submit(select);

    if (isValidationError(submitted)) {
        expect(submitted).toEqual('should never happen');
    }

    expect(submitted).toBe('green');

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

const numeric = <Z extends z.ZodNumber | z.ZodOptional<z.ZodNumber>>(
    schema: Z
): ParsedInput<{ stringValue: string }, Z> =>
    parsedInput(
        { stringValue: '' },
        (value) => ({ stringValue: String(value) }),
        (state) => {
            if (state.stringValue === '') {
                return undefined;
            }
            const value = parseFloat(state.stringValue);
            if (Number.isNaN(value)) {
                return error(`Cannot parse number from ${state.stringValue}`);
            }
            return value;
        },
        schema
    ) as unknown as ParsedInput<{ stringValue: string }, Z>;
// as unknown required you to understand zod types which is a shame

test('can make numeric input', () => {
    const age = numeric(z.number().int().min(18));

    age.state.stringValue = '5';
    expect(current(age)).toBe(5);
    expect(() => valid(age)).toThrowError();

    age.state.stringValue = '0';
    expect(current(age)).toBe(0);
    expect(() => valid(age)).toThrowError();

    age.state.stringValue = '';
    expect(current(age)).toBe(undefined);
    expect(() => valid(age)).toThrowError();

    age.state.stringValue = '30';
    expect(current(age)).toBe(30);
    expect(valid(age)).toBe(30);

    age.state.stringValue = 'old enough';
    expect(() => current(age)).toThrowError();
    expect(() => valid(age)).toThrowError();

    const prefferedFloor = numeric(z.number().int().min(1).max(15).optional());
    prefferedFloor.state.stringValue = '5';
    expect(current(prefferedFloor)).toBe(5);
    expect(valid(prefferedFloor)).toBe(5);

    prefferedFloor.state.stringValue = '';
    expect(current(prefferedFloor)).toBe(undefined);
    expect(valid(prefferedFloor)).toBe(undefined);

    prefferedFloor.state.stringValue = 'ground';
    expect(() => current(prefferedFloor)).toThrowError();
    expect(() => valid(prefferedFloor)).toThrowError();
    expect(current(prefferedFloor, 10)).toBe(10);
    expect(valid(prefferedFloor, 10)).toBe(10);
});
