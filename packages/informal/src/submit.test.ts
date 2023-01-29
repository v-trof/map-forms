import { error, ErrorBox, Input } from './domain';
import { errorBox, input } from './informal';
import { valid } from './readers';
import { isInvalidForm, submit } from './submit';
import { all, maxLength, minLength } from './validators';

export type SignInStore = {
    login: Input<string>;
    password: Input<string>;
};

export const createSignInStore = () => {
    const store: SignInStore = {
        login: input(),
        password: input(all(minLength(8), maxLength(40))),
    };

    return store;
};

test('Supports submit', () => {
    const signin = createSignInStore();

    signin.login.value = 'v-trof';
    signin.password.value = 'securePass';

    const result = submit(signin);

    expect(result).toEqual({ login: 'v-trof', password: 'securePass' });
});

// arrays in submit
// value as a key in store

test('Does not submit invalid values', () => {
    const signin = createSignInStore();

    const result = submit(signin);

    expect(isInvalidForm(result)).toEqual(true);
});

test('Can create submit reports', () => {
    const signin = createSignInStore();

    signin.login.value = 'v-trof';

    const result = submit(signin);

    expect(isInvalidForm(result)).toEqual(true);

    if (isInvalidForm(result)) {
        expect(result.report).toEqual({
            login: 'v-trof',
            password: { error: 'required' },
        });
    }
});

export type SignUpStore = {
    login: Input<string>;
    password: Input<string>;
    notSame: ErrorBox;
};

export const createSignUpStore = () => {
    const store: SignUpStore = {
        login: input(),
        password: input(all(minLength(8), maxLength(40))),
        notSame: errorBox(() => {
            if (valid(store.login) === valid(store.password)) {
                return error('password equal to login is not secure enough');
            }
        }),
    };

    return store;
};

test('Does not include error box in submit', () => {
    const signup = createSignUpStore();

    signup.login.value = 'v-trof';
    signup.password.value = 'securePass';

    expect(submit(signup)).toEqual({ login: 'v-trof', password: 'securePass' });
});

test('Does not allow submit if error box has an error', () => {
    const signup = createSignUpStore();

    signup.login.value = 'v-trof-login';
    signup.password.value = 'v-trof-login';

    const result = submit(signup);

    expect(isInvalidForm(result)).toBe(true);
});
