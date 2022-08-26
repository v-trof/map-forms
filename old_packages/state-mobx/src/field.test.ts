import { field } from './field';
import { submit } from './submit';
import { minLength } from './validation/validators';

describe('field', () => {
    it('is required by default', () => {
        const name = field<string>();

        expect(name.validationErrors.runtime).toEqual({ message: 'error.required' })
    });

    it('returns a validationResult from getValidValue', () => {
        const title = field<string>(minLength(4));

        expect(title[submit]()).toEqual({
            isValid: false, error: { message: "error.required" }
        });

        title.value = 'kek'

        expect(title[submit]()).toEqual({
            isValid: false, error: { message: "error.minLength", params: { min: 4 } }
        });

        title.value = 'informal'

        expect(title[submit]()).toEqual({
            isValid: true, value: 'informal'
        });
    })
})

describe('optional field', () => {
    it('can be empty by default', () => {
        const description = field.optional<string>();

        expect(description.validationErrors.runtime).toEqual(undefined);
    })

    it('does not call validators for undefined values', () => {
        const description = field.optional<string>(minLength(10));

        expect(description.validationErrors.runtime).toEqual(undefined);
    })

    it('does call validators for non-empty values', () => {
        const description = field.optional<string>(minLength(10));

        description.value = 'cool!';

        expect(description.validationErrors.runtime).toEqual({ message: "error.minLength", params: { min: 10 } });
    })
})