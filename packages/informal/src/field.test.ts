import { field } from './field';
import { backend, invalid, min, minLength, parsing } from './validation';

describe('@informal/field', () => {
    it('Allows reading and writing into a field', () => {
        const name = field<string>();
        name.value = 'Mark';

        expect(name.value).toEqual('Mark');

        name.value = 'Joe';
        expect(name.value).toEqual('Joe');
    });

    it('Considers all fields required by default', () => {
        const name = field<string>();

        expect(name.getError()).toEqual(invalid('required'));

        name.value = 'Mark';
        expect(name.getError()).toEqual(undefined);
    });

    it('Supports passing a validator to a field', () => {
        const name = field(minLength(3));

        // required is always a priority validator
        expect(name.getError()).toEqual(invalid('required'));

        name.value = 'Ma';
        expect(name.getError()).toEqual(invalid('minLength', { min: 3 }));

        name.value = 'Mark';
        expect(name.getError()).toEqual(undefined);
    });

    it('Supports optional fields', () => {
        const name = field.optional(minLength(3));

        // optional is valid when empty, if not validators are called
        expect(name.getError()).toEqual(undefined);

        name.value = 'Ma';
        expect(name.getError()).toEqual(invalid('minLength', { min: 3 }));

        name.value = 'Mark';
        expect(name.getError()).toEqual(undefined);
    });

    it('Only returns a valid value on submit', () => {
        const name = field(minLength(3));

        name.value = 'Ma';
        expect(name.submit()).toEqual(invalid('minLength', { min: 3 }));

        name.value = 'Mark';
        expect(name.submit()).toEqual('Mark');
    });

    it('Supports adding and clearing backend error', () => {
        const username = field(minLength(3));

        username.value = 'v-';
        expect(username.submit()).toEqual(invalid('minLength', { min: 3 }));

        username.value = 'v-trof';
        expect(username.submit()).toEqual('v-trof');

        // shows when set
        username.addError(backend, invalid('Username v-trof is taken'));
        expect(username.getError()).toEqual(
            invalid('Username v-trof is taken')
        );

        // clears on change
        username.addError(backend, invalid('Username v-trof is taken'));
        username.value = 'vtrof';
        expect(username.getError()).toEqual(undefined);

        // clears on submit
        username.addError(backend, invalid('Username v-trof is taken'));
        expect(username.submit()).toEqual('vtrof');
        expect(username.getError()).toEqual(undefined);
    });

    it('Supports adding and clearing parsing error', () => {
        const price = field(min(10));

        price.value = 3;
        expect(price.submit()).toEqual(invalid('min', { min: 10 }));

        price.value = 15;
        expect(price.submit()).toEqual(15);

        // shows when set
        price.addError(parsing, invalid('Input a valid price'));
        expect(price.getError()).toEqual(invalid('Input a valid price'));

        // clears on change
        price.addError(parsing, invalid('Input a valid price'));
        price.value = 30;
        expect(price.getError()).toEqual(undefined);

        // does not clear on submit
        price.addError(parsing, invalid('Input a valid price'));
        expect(price.submit()).toEqual(invalid('Input a valid price'));
        expect(price.getError()).toEqual(invalid('Input a valid price'));
    });
});
