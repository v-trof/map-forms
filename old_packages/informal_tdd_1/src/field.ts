import {
    Validate,
    Invalid,
    all,
    ExternalError,
    isInvalid,
    parsing,
    backend,
    required,
} from './validation';

export type BaseField<RawValue, ValidValue> = {
    _value: RawValue;
    _errors: ExternalError[];

    value: RawValue;
    getError(): Invalid | undefined;
    submit(): Invalid | ValidValue;

    addError(key: ExternalError['key'], error: ExternalError['error']): void;
};

export type Field<Value> = {
    value: Value | undefined;
    getError(): Invalid | undefined;
    submit(): Invalid | Value;

    addError(key: unknown, error: Invalid): void;
};

const noop: Validate<unknown> = () => undefined;

const baseField = <RawValue, ValidValue>(
    intialValue: RawValue,
    validate: (
        value: RawValue,
        externalErrors: ExternalError[]
    ) => Invalid | ValidValue
) => {
    const fieldStore: BaseField<RawValue, ValidValue> = {
        _errors: [],
        _value: intialValue,

        get value() {
            return fieldStore._value;
        },
        set value(newValue) {
            fieldStore._errors.length = 0;
            fieldStore._value = newValue;
        },
        getError: () => {
            const errorOrValue = validate(
                fieldStore._value,
                fieldStore._errors
            );

            if (isInvalid(errorOrValue)) {
                return errorOrValue;
            }

            return undefined;
        },
        submit: () => {
            // clear backend errors as submit === revalidation
            fieldStore._errors = fieldStore._errors.filter(
                (x) => x.key !== backend
            );

            const errorOrValue = validate(
                fieldStore._value,
                fieldStore._errors
            );

            return errorOrValue;
        },
        addError: (key, error) => {
            fieldStore._errors.push({ key, error });
        },
    };

    return fieldStore;
};

export const field = <Value>(validator: Validate<Value> = noop) => {
    const validateEmpty = all<undefined>(parsing, backend, required);
    const validateFilled = all<Value>(parsing, backend, validator);

    const fieldStore: Field<Value> = baseField<Value | undefined, Value>(
        undefined,
        (value, externalErrors) => {
            if (value === undefined) {
                const error = validateEmpty(undefined, externalErrors);

                // required is gurateed to return an error in this case
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                return error!;
            }

            return validateFilled(value, externalErrors) || value;
        }
    );

    return fieldStore;
};

field.optional = <Value>(validator: Validate<Value> = noop) => {
    const validateEmpty = all<undefined>(parsing, backend);
    const validateFilled = all<Value>(parsing, backend, validator);

    const fieldStore: Field<Value | undefined> = baseField<
        Value | undefined,
        Value | undefined
    >(undefined, (value, externalErrors) => {
        if (value === undefined) {
            const error = validateEmpty(undefined, externalErrors);
            return error;
        }

        return validateFilled(value, externalErrors) || value;
    });

    return fieldStore;
};
