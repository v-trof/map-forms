import { z } from 'zod';

import { valid } from './access';
import { error, getError, isValidationError } from './domain';
import { input } from './input';
import { validation } from './validation';

test('Validation works', () => {
    const store = input(z.string());
    const validate = validation(() => {
        if (store.value == 'peanuts') {
            return error('No peanuts allowed');
        }
    });
    store.value = '';
    expect(isValidationError(validate[getError]())).toBe(false);
    store.value = 'peanuts';
    expect(isValidationError(validate[getError]())).toBe(true);
});

test('validation can be based on valid values only', () => {
    const store = input(z.string().min(1));
    const validate = validation(() => {
        if (valid(store) === 'peanuts') {
            return error('No peanuts allowed');
        }
    });
    store.value = '';
    expect(isValidationError(validate[getError]())).toBe(true); // empty string is not valid => no peanuts failed in a chain
    store.value = 'peanuts';
    expect(isValidationError(validate[getError]())).toBe(true);
});
