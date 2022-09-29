import { Validate, Invalid } from './validation';

export type Field<Value> = {
    _value: Value | undefined;
    _errors: Array<{ key: unknown; error: Invalid }>;

    value: Value | undefined;
    getError(): Invalid | undefined;
    submit(): Invalid | Value;

    addError(key: unknown, error: Invalid): void;
};

// TODO: Remove direct dependency on backend and parsing with extendable system
export const backend = () => undefined;
export const parsing = () => undefined;

export const field = <Value>(validator?: Validate<Value>) => {
    const fieldStore: Field<Value> = {
        _errors: [],
        _value: undefined,

        get value() {
            return fieldStore._value;
        },
        set value(newValue) {
            fieldStore._errors.length = 0;
            fieldStore._value = newValue;
        },
        getError: () => {
            if (fieldStore._errors.length > 0) {
                return fieldStore._errors[0].error;
            }

            if (fieldStore.value === undefined) {
                return { message: 'required' };
            }

            if (validator) {
                return validator(fieldStore.value);
            }
        },
        submit: () => {
            // clear backend errors as submit === revalidation
            fieldStore._errors = fieldStore._errors.filter(
                (x) => x.key !== backend
            );
            const error = fieldStore.getError();

            if (error) {
                return error;
            }

            return fieldStore.value as Value;
        },
        addError: (key, error) => {
            fieldStore._errors.push({ key, error });
        },
    };

    return fieldStore;
};

// TODO: Remove duplicate code
field.optional = <Value>(validator?: Validate<Value>) => {
    const fieldStore: Field<Value | undefined> = {
        _value: undefined,

        get value() {
            return fieldStore._value;
        },
        set value(newValue) {
            fieldStore._errors.length = 0;
            fieldStore._value = newValue;
        },

        getError: () => {
            if (fieldStore._errors.length > 0) {
                return fieldStore._errors[0].error;
            }

            if (fieldStore.value === undefined) {
                return undefined;
            }

            if (validator) {
                return validator(fieldStore.value);
            }
        },
        submit: () => {
            fieldStore._errors.length = 0;
            const error = fieldStore.getError();

            if (error) {
                return error;
            }

            return fieldStore.value as Value;
        },
        _errors: [],
        addError: (key, error) => {
            fieldStore._errors.push({ key, error });
        },
    };

    return fieldStore;
};
