import { error, ErrorBox, Input } from './domain';
import { errorBox, input } from './informal';
import { valid } from './readers';
import { all, maxLength, minLength } from './validators';

test('Supports writing value into an input', () => {
    const login = input();

    login.value = 'v-trof';

    expect(login.value).toBe('v-trof');
    expect(login.getValid()).toBe('v-trof');
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

test('Considers error box empty if it couldn`t access related values', () => {
    const singup = createSignUpStore();

    expect(singup.notSame.approved).toBe(false);
});
