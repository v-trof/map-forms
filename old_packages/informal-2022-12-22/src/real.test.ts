import { ErrorBox, Validate } from './api/contract';
import { errorBox } from './api/errorBox';
import { field, Field, Strict } from './api/field';
import { current, valid } from './api/getters';
import { error } from './api/utils';
import { all, lengthRange, minLength } from './api/validators';

describe('Real world use cases', () => {
    describe('repo', () => {
        /* The simples case to measure default overhead */
        type RepoStore = {
            name: Field<string>;
            type: Strict<Field<'public' | 'private'>>;
        };

        const createRepoStore = () => {
            const store: RepoStore = {
                name: field(),
                type: field.strict('public'),
            };

            return store;
        };

        it('Allows filling in values and submitting', () => {
            const store = createRepoStore();

            // expect(submit(store)).toMatchObject({ isValid: false });
        });
    });

    describe('signup with fancy password rules', () => {
        // mb password.ts
        const checkPassword = (value = '') => {
            return {
                inRange: lengthRange(8, 64)(value) === undefined,
                hasUpperCase: /[A-Z]/.test(value),
                hasLowerCase: /[a-z]/.test(value),
                hasNumeric: /[0-9]/.test(value),
                hasSpecial: /!#$%&? "/.test(value),
            };
        };

        const validatePassword: Validate<string> = (value) => {
            const { inRange, ...characterTypes } = checkPassword(value);

            if (!inRange) {
                // we will not display these anyway
                return error('invalid password: inRange');
            }

            if (Object.values(characterTypes).filter(Boolean).length < 3) {
                return error('invalid password: characterTypes');
            }
        };

        // ah whatever just take risk / do not do removable

        // signup.ts
        type SignupStore = {
            login: Field<string>;

            password: Field<string>;
            passwordChecks: ReturnType<typeof checkPassword>;

            loginSameAsPassword: ErrorBox;
        };

        const createSignupStore = () => {
            const store: SignupStore = {
                login: field(minLength(3)),

                password: field(validatePassword),
                get passwordChecks() {
                    return checkPassword(current(store.password));
                },

                loginSameAsPassword: errorBox(() => {
                    if (valid(store.login) === valid(store.password)) {
                        return error('error.password=login');
                    }
                }),
            };

            return store;
        };

        it('Allows filling in values and submitting', () => {
            const store = createSignupStore();

            // expect(submit(store)).toMatchObject({ isValid: false });
        });
    });
});
