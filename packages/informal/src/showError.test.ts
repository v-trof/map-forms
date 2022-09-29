import { field } from './field';
import { multiValidator } from './multiValidator';
import {
    all,
    backend,
    invalid,
    Invalid,
    max,
    maxLength,
    min,
    minLength,
    parsing,
} from './validation';

const alwaysShowError = (errorContainer: {
    getError: () => Invalid | undefined;
}) => {
    const error = errorContainer.getError();

    return error;
};

// const showErrorAsFeedback = (errorContainer: {
//     getError: () => Invalid | undefined;
//     interactionStatus: 'new' | 'active' | 'wasActive';
// }) => {
//     const error = errorContainer.getError();

//     return error;
// };

describe('@informal/showError', () => {
    describe('alwaysShow', () => {
        it('Shows an error on a field if it is preset', () => {
            const password = field(all(minLength(8), maxLength(32)));

            expect(alwaysShowError(password)).toEqual(invalid('required'));

            password.value = 'short';
            expect(alwaysShowError(password)).toEqual(
                invalid('minLength', { min: 8 })
            );

            password.value = 'a lot of letters so much it doesn`t fit in a db';
            expect(alwaysShowError(password)).toEqual(
                invalid('maxLength', { max: 32 })
            );

            password.value = 'a nice password';
            expect(alwaysShowError(password)).toEqual(undefined);
        });

        it('Supports multivalidator', () => {
            const login = field<string>();
            const password = field<string>();

            const notSame = multiValidator(() => {
                if (login.value === password.value) {
                    return invalid('Login must to be equal to password');
                }
            });

            expect(alwaysShowError(notSame)).toEqual(
                invalid('Login must to be equal to password')
            );

            login.value = 'Me';
            password.value = 'pass';
            expect(alwaysShowError(notSame)).toEqual(undefined);

            password.value = 'Me';
            expect(alwaysShowError(notSame)).toEqual(
                invalid('Login must to be equal to password')
            );
        });

        it('Shows errors in order parsing -> backend -> required -> other validators', () => {
            const price = field(all(min(1), max(1000)));

            // all errors
            price.addError(backend, invalid('Price that is not fair'));
            price.addError(parsing, invalid('"0." is not a number'));

            expect(alwaysShowError(price)).toEqual(
                invalid('"0." is not a number')
            );

            // without parsing error
            price.value = 9.99;
            price.value = undefined;
            price.addError(backend, invalid('Price that is not fair'));
            expect(alwaysShowError(price)).toEqual(
                invalid('Price that is not fair')
            );

            // without backend, parsing errors
            price.value = undefined;
            expect(alwaysShowError(price)).toEqual(invalid('required'));

            // without required, backend, parsing errors
            price.value = 0.5;
            expect(alwaysShowError(price)).toEqual(invalid('min', { min: 1 }));

            // without required, backend, parsing, min errors
            price.value = 100500;
            expect(alwaysShowError(price)).toEqual(
                invalid('max', { max: 1000 })
            );

            // valid
            price.value = 10;
            expect(alwaysShowError(price)).toEqual(undefined);
        });
    });
});
