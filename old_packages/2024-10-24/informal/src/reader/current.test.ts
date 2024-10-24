import { CurrentValueBox, getCurrentValue } from '../domain';
import { input } from '../input';
import { all, maxLength, minLength } from '../validators';

import { current } from './current';

export const createSignUpStore = () => {
    const store = {
        login: input(),
        password: input(all(minLength(8), maxLength(40))),
    };

    return store;
};

test('Gets current value of an input', () => {
    const password = input(all(minLength(8), maxLength(40)));

    // valid
    password.value = 'securePass';
    expect(current(password)).toBe('securePass');

    // invalid
    password.value = 'short';
    expect(current(password)).toBe('short');

    // empty
    password.value = undefined;
    expect(current(password)).toBe(undefined);
});

test('Supports fallback', () => {
    const price: CurrentValueBox<number> = {
        [getCurrentValue]: () => undefined,
    };

    // used, same type
    const value1 = current(price, 5);
    expect(value1).toBe(5);

    // used, different type
    const value2 = current(price, null);
    expect(value2).toBe(null);

    // unused fallback
    const password = input(all(minLength(8), maxLength(40)));

    password.value = 'securePass';
    expect(current(password, '')).toBe('securePass');
});

test('Throws if read context is not ready for unsucessful reads and there is no fallback', () => {
    const price: CurrentValueBox<number> = {
        [getCurrentValue]: () => undefined,
    };

    expect(() => current(price)).toThrowError(
        new Error(
            '@informal/readContext use fallback when you use a reader outside of an errorBox'
        )
    );
});

test.todo('Gets current value of a store (object)');
test.todo('Ignores error boxes in the store');

test.todo('Gets current value of a store (nested object)');
test.todo('Gets current value of a store (nested array)');
