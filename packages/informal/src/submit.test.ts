import { makeAutoObservable } from "mobx";
import { check } from "./check";
import { field } from "./field"
import { autoSubmit } from "./submit"
import { error, minLength } from "./validation/validators"


type SignupDTO = {
    name: string;
    password: string;
}

describe('autoSubmit', () => {
    it('replaces fields with values', () => {
        const signup = {
            name: field<string>(),
            password: field<string>(minLength(3)),
        }

        signup.name.value = 'Carl'
        signup.password.value = '12345678'

        expect(autoSubmit(signup)).toEqual({ 
            isValid: true, 
            value: { 
                name: 'Carl',
                password: '12345678'
            } 
        });
    });

    it('returns { isValid: false } if any field is invalid', () => {
        const signup = {
            name: field<string>(),
            password: field<string>(minLength(3)),
        }

        signup.name.value = 'Carl'
        signup.password.value = '0'

        expect(autoSubmit(signup).isValid).toBe(false);
    });

    it('returns { isValid: false } if any check is invalid', () => {
        const signup = {
            name: field<string>(),
            password: field<string>(minLength(3)),
            notSame: check(() => {
                if(signup.name.value === signup.password.value) {
                    return error('signup.passwordNameSame')
                }
            })
        }

        signup.name.value = 'Carl'
        signup.password.value = 'Carl'

        expect(autoSubmit(signup)).toEqual({ isValid: false, error: { message: 'signup.passwordNameSame' }});
    });

    it('infers type correctly fields with values', () => {        
        const signup = {
            name: field<string>(),
            password: field<string>(minLength(3)),
        }

        signup.name.value = 'Carl'
        signup.password.value = '12345678'

        const result = autoSubmit(signup)
        
        if(result.isValid) {
            const value: SignupDTO = result.value;
            expect(value).toBeDefined(); // just so jest will no find it weird
        }

        expect(result).toEqual({ 
            isValid: true, 
            value: { 
                name: 'Carl',
                password: '12345678'
            } 
        });
    });

    it('extracts value from nested stores', () => {
        const generalInfo = makeAutoObservable({
            name: field<string>(),
            password: field<string>(minLength(3)),
            notSame: check(() => {
                if(generalInfo.name.value === generalInfo.password.value) {
                    return error('signup.passwordNameSame')
                }
            })
        })

        const addressInfo = makeAutoObservable({
            country: field<string>(),
            city: field.optional<string>()
        })

        const signup = { generalInfo, addressInfo };

        signup.addressInfo.country.value = 'US';
        signup.generalInfo.name.value = 'Carl';
        signup.generalInfo.password.value = '12345678'

        const result = autoSubmit(signup)
        
        if(result.isValid) {
            type DTO = {
                generalInfo: { name: string, password: string },
                addressInfo: { country: string, city: string | undefined }
            }
            const value: DTO = result.value;
            expect(value).toBeDefined(); // just so jest will no find it weird
        }

        expect(result).toEqual({ 
            isValid: true, 
            value: { 
                addressInfo: { country: 'US' },
                generalInfo: { name: 'Carl', password: '12345678' } 
            } 
        });
    });

    it('Fails if nesed store validation fails', () => {
        const generalInfo = makeAutoObservable({
            name: field<string>(),
            password: field<string>(minLength(3)),
            notSame: check(() => {
                if(generalInfo.name.value === generalInfo.password.value) {
                    return error('signup.passwordNameSame')
                }
            })
        })

        const addressInfo = makeAutoObservable({
            country: field<string>(),
            city: field.optional<string>()
        })

        const signup = { generalInfo, addressInfo };

        signup.addressInfo.country.value = 'US';
        signup.generalInfo.name.value = 'Carl';
        signup.generalInfo.password.value = 'Carl'

        const result = autoSubmit(signup)

        expect(result).toEqual({ 
            isValid: false,
            error: { message: 'signup.passwordNameSame' }
        });
    });

    it('Ignores non-field values', () => {
        const generalInfo = makeAutoObservable({
            name: field<string>(),
            password: field<string>(minLength(3)),
            notSame: check(() => {
                if(generalInfo.name.value === generalInfo.password.value) {
                    return error('signup.passwordNameSame')
                }
            })
        })

        const addressInfo = makeAutoObservable({
            country: field<string>(),
            city: field.optional<string>(),
            get flag() {
                return `/flags/${addressInfo.country}`
            }
        })

        const signup = { generalInfo, addressInfo, experimentGroup: 10 };

        signup.addressInfo.country.value = 'US';
        signup.generalInfo.name.value = 'Carl';
        signup.generalInfo.password.value = '12345678'

        const result = autoSubmit(signup)

        // does not infer
        if(result.isValid) {
            type DTO = {
                generalInfo: { name: string, password: string },
                addressInfo: { country: string, city: string | undefined }
            }
            const value: DTO = result.value;
            expect(value).toBeDefined(); // just so jest will not consider value access weird

            // @ts-expect-error
            result.value.addressInfo.flag

            // @ts-expect-error
            result.value.generalInfo.notSame

            // @ts-expect-error
            result.value.experimentGroup
        }


        // does not return
        expect(result).toEqual({ 
            isValid: true, 
            value: { 
                addressInfo: { country: 'US' },
                generalInfo: { name: 'Carl', password: '12345678' } 
            } 
        });
    });
})