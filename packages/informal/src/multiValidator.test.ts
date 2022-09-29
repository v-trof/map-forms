import { field } from './field';
import { multiValidator } from './multiValidator';

describe('@informal/multiValidator', () => {
    it('Returns an error when a check within it fails', () => {
        const login = field<string>();
        const password = field<string>();

        const notSame = multiValidator(() => {
            if (login.value === password.value) {
                return { message: 'Login must to be equal to password' };
            }
        });

        // the error exists regardless of validity of parent fields
        expect(notSame.getError()).toEqual({
            message: 'Login must to be equal to password',
        });

        login.value = 'Me';
        password.value = 'pass';
        expect(notSame.getError()).toEqual(undefined);

        password.value = 'Me';
        expect(notSame.getError()).toEqual({
            message: 'Login must to be equal to password',
        });
    });
});
