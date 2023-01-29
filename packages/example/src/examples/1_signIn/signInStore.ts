import { Input, input, all, maxLength, minLength } from '@informal/pkg';

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
