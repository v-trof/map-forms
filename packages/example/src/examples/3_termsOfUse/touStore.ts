import {
    error,
    Input,
    all,
    maxLength,
    minLength,
    input,
    current,
    valid,
    Validator,
} from '@informal/pkg';

export type Country = 'US' | 'UK' | 'DE' | 'ES';

export type FancyPasswordChecksStore = {
    email: Input<string>;
    country: Input<Country>;
    acceptToU: Input<boolean>;
    touLink: string;
};

const hasLetters = (value: string) => {
    return /[a-zA-Z]/.test(value);
};

const hasNumbers = (value: string) => {
    return /[0-9]/.test(value);
};

const hasSpecial = (value: string) => {
    return /[!?.,\-_]/.test(value);
};

const notSame =
    (login: () => string): Validator<string> =>
    (value) => {
        if (login() === value) {
            return error('password equal to login is not secure enough');
        }
    };

const checks = [hasLetters, hasNumbers, hasSpecial];

/**
 * At least 2 types of characters
 */
const strongPassword = () => (value: string) => {
    if (checks.filter((c) => c(value)).length < 2) {
        return error('Password is too weak');
    }
};

export const createFancyPasswordChecksStore = () => {
    const store: FancyPasswordChecksStore = {
        login: input(),
        password: input(
            all(
                minLength(8),
                maxLength(40),
                strongPassword(),
                notSame(() => valid(store.login))
            )
        ),
        get passwordChecks() {
            const password = current(store.password) || '';

            return {
                minLength: minLength(8)(password) === undefined,
                letters: hasLetters(password),
                numbers: hasNumbers(password),
                special: hasSpecial(password),
            };
        },
    };

    return store;
};
