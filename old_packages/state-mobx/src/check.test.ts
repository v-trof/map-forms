import { Check, check } from "./check";
import { Field, field } from "./field";
import { error, minLength } from "./validation/validators";

describe('check', () => {
    it('runs own validator', () => {
        const signup = {
            name: field<string>(),
            password: field<string>(minLength(3)),
            notSame: check(() => {
                if (signup.name.value === signup.password.value) {
                    return error('signup.passwordNameSame')
                }
            })
        }

        signup.name.value = 'Carl'
        signup.password.value = 'Carl'

        expect(signup.notSame.validationErrors.runtime).toEqual(error('signup.passwordNameSame'))
    });

    it('supports custom interaction status inference', () => {
        const signup: { name: Field<string>, password: Field<string>, notSame: Check } = {
            name: field<string>(),
            password: field<string>(minLength(3)),
            notSame: check(
                () => {
                    if (signup.name.value === signup.password.value) {
                        return error('signup.passwordNameSame')
                    }
                }
            )
        }

        expect(signup.notSame.interactionStatus).toEqual('new');

        signup.name.value = 'Carl'
        signup.password.value = 'Carl'

        signup.name.interactionStatus = 'wasActive'
        signup.password.interactionStatus = 'wasActive'

        expect(signup.notSame.interactionStatus).toEqual('wasActive')
    });

    it('Is considered new if any of the accessed fields is invalid', () => {
        const signup: { name: Field<string>, password: Field<string>, notSame: Check } = {
            name: field<string>(),
            password: field<string>(minLength(3)),
            notSame: check(
                () => {
                    if (signup.name.value === signup.password.value) {
                        return error('signup.passwordNameSame')
                    }
                }
            )
        }

        expect(signup.notSame.interactionStatus).toEqual('new');

        signup.name.value = 'Yu'
        signup.password.value = 'Yu'

        signup.name.interactionStatus = 'wasActive'
        signup.password.interactionStatus = 'wasActive'

        expect(signup.notSame.interactionStatus).toEqual('new')
    });
})