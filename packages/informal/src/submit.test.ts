import { z } from 'zod';

import { valid } from './access';
import { error, isValidationError } from './domain';
import { input } from './input';
import { submit } from './submit';
import { validation } from './validation';

test('submit can submit a an input', () => {
    const form = {
        name: input(z.string()),
    };
    form.name.value = 'hello';
    const result = submit(form.name);
    expect(result).toBe('hello');
});

test('submit fails for invalid input', () => {
    const form = {
        name: input(z.string()),
    };
    form.name.value = 'hello';
    form.name.value = undefined;
    const result = submit(form.name);
    expect(isValidationError(result)).toBe(true);
});

test('submit sets approved on all inputs', () => {
    const form = {
        name: input(z.string()),
        age: input(z.number()),
        address: {
            street: input(z.string()),
            city: input(z.string()),
            state: input(z.string()),
        },
    };
    form.name.value = 'hello';
    form.name.approved = true;
    submit(form);
    expect(form.name.approved).toBe(true);
    expect(form.age.approved).toBe(true);
    expect(form.address.street.approved).toBe(true);
    expect(form.address.city.approved).toBe(true);
    expect(form.address.state.approved).toBe(true);
});

test('sbumit returns valid value for entire form', () => {
    const form = {
        name: input(z.string()),
        age: input(z.number()),
        address: {
            street: input(z.string()),
            city: input(z.string()),
            state: input(z.string()),
        },
    };
    form.name.value = 'hello';
    form.age.value = 10;
    form.address.street.value = '123 Main St';
    form.address.city.value = 'Anytown';
    form.address.state.value = 'CA';
    const result = submit(form);
    expect(result).toEqual({
        name: 'hello',
        age: 10,
        address: {
            street: '123 Main St',
            city: 'Anytown',
            state: 'CA',
        },
    });
});

test('submit validates entire form', () => {
    const form = {
        name: input(z.string()),
        age: input(z.number()),
        address: {
            street: input(z.string()),
            city: input(z.string()),
            state: input(z.string()),
        },
    };
    form.name.value = 'hello';
    form.age.value = 10;
    form.address.street.value = '123 Main St';
    form.address.city.value = 'Anytown';
    // form.address.state.value = 'CA';
    const result = submit(form);
    expect(isValidationError(result)).toBe(true);
});

test('submit provides a report to debug invalid forms', () => {
    const form = {
        name: input(z.string()),
        age: input(z.number()),
        address: {
            street: input(z.string()),
            city: input(z.string()),
            state: input(z.string()),
        },
    };
    form.name.value = 'hello';
    form.age.value = 10;
    form.address.street.value = '123 Main St';
    form.address.city.value = 'Anytown';
    // form.address.state.value = 'CA'; // intentionally left out to trigger error

    const result = submit(form);
    expect(isValidationError(result)).toBe(true);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const report = (result as any).params;
    expect(report.name).toEqual('hello');
    expect(report.age).toEqual(10);
    expect(report.address.street).toEqual('123 Main St');
    expect(report.address.city).toEqual('Anytown');
    expect(isValidationError(report.address.state)).toBe(true);
});

test('submit approves all inputs', () => {
    const form = {
        name: input(z.string()),
        age: input(z.number()),
        address: {
            street: input(z.string()),
            city: input(z.string()),
            state: input(z.string()),
        },
    };
    form.name.value = 'hello';
    // form.age.value = 10; -- errors for force early return if it can happen
    form.address.street.value = '123 Main St';
    form.address.city.value = 'Anytown';
    // form.address.state.value = 'CA'; -- errors for force early return if it can happen
    submit(form);
    expect(form.name.approved).toBe(true);
    expect(form.age.approved).toBe(true);
    expect(form.address.street.approved).toBe(true);
    expect(form.address.city.approved).toBe(true);
    expect(form.address.state.approved).toBe(true);
});

test('submit checks validation as well as inputs', () => {
    const form = {
        password: input(z.string().min(8).max(40)),
        repeatPassword: input(z.string().min(8).max(40)),
        notSame: validation(() => {
            if (valid(form.password) !== valid(form.repeatPassword)) {
                return error('Passwords do not match');
            }
        }),
    };

    form.password.value = 'password';
    form.repeatPassword.value = 'different password';

    const result = submit(form);
    expect(isValidationError(result)).toBe(true);

    form.repeatPassword.value = 'password';
    const result2 = submit(form);
    expect(result2).toEqual({
        password: 'password',
        repeatPassword: 'password',
    });
});
