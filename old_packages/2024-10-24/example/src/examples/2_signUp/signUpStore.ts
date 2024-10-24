import {
    error,
    ErrorBox,
    Input,
    all,
    maxLength,
    minLength,
    valid,
    errorBox,
    input,
} from '@informal/pkg';

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
