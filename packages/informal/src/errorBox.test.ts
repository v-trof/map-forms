import { error, getError } from './domain';
import { errorBox } from './errorBox';
import { input } from './input';
import { isValid, valid } from './reader/valid';
import { all, maxLength, minLength } from './validators';

const signup = () => {
    const store = {
        login: input(),
        password: input(all(minLength(8), maxLength(40))),
        notSame: errorBox(() => {
            if (valid(store.login) === valid(store.password)) {
                return error('password=login is bad');
            }
        }),
    };

    return store;
};

test('Is runs validator to caclulate the error', () => {
    const store = signup();

    store.login.value = 'v-trof-long';
    store.password.value = 'v-trof-long';

    expect(store.notSame[getError]()).toEqual(error('password=login is bad'));

    store.password.value = 'securePass';

    expect(store.notSame[getError]()).toEqual(undefined);
});

test('Is approved only when all values it accessed are approved', () => {
    const store = signup();

    store.login.value = 'v-trof';
    store.password.value = 'securePass';

    expect(store.notSame.approved).toBe(false);

    store.login.approved = true;
    expect(store.notSame.approved).toBe(false);

    store.password.approved = true;
    expect(store.notSame.approved).toBe(true);
});

test('Is approved only when all values it accessed are available', () => {
    const store = signup();

    store.login.value = 'v-trof';
    store.password.value = 'v-trof';
    store.login.approved = true;
    store.password.approved = true;

    // TODO: add isValid check
    expect(isValid(store.password)).toBe(false);
    expect(store.notSame.approved).toBe(false);

    store.login.value = 'v-trof-long';
    store.password.value = 'v-trof-long';

    expect(isValid(store.password)).toBe(true);
    expect(store.notSame.approved).toBe(true);
});
