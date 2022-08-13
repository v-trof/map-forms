import { computed, makeAutoObservable, observable } from "mobx";
import { checkContext } from "./check";
import { informalType, ValueContainer } from "./submit";
import { ValidationError, ValidationResult, Validator } from "./validation/validationTypes";
import { required } from "./validation/validators";

export type FormalField<Value, ValidValue> = ValueContainer<ValidValue> & {
    value: Value;
    validationErrors: {
        parsing: ValidationError | undefined;
        runtime: ValidationError | undefined;
        backend: ValidationError | undefined;
    };
    isValid: boolean;
    interactionStatus: 'new' | 'active' | 'wasActive';
}

export type Field<T> = ValueContainer<T> & {
    value: T | undefined;
    validationErrors: {
        parsing: ValidationError | undefined;
        runtime: ValidationError | undefined;
        backend: ValidationError | undefined;
    };
    isValid: boolean;
    interactionStatus: 'new' | 'active' | 'wasActive';
}

export type MakeFieldOptions<Value> = {
    required: boolean;
    initialValue: Value;
    validation: Validator<Value> | undefined;
}

export const makeFormalField = <Value, ValidValue>(options: MakeFieldOptions<Value>): FormalField<Value, ValidValue> => {
    let value = observable.box(options.initialValue);

    const fieldStore: FormalField<Value, ValidValue> = makeAutoObservable({
        get value() {
            checkContext.onFieldUsed(fieldStore);
            return value.get();
        },
        set value(newValue: Value) {
            value.set(newValue);
        },
        validationErrors: {
            parsing: undefined,
            backend: undefined,
            get runtime() {
                const requiredError = required(fieldStore.value);

                if (requiredError) {
                    return options.required ? requiredError : undefined;
                }

                if (options.validation) {
                    // required filters out undefined
                    return options.validation(fieldStore.value);
                }

                return undefined;
            },
        },
        interactionStatus: 'new',
        getValidValue: (): ValidationResult<ValidValue> => {
            const errors = [
                fieldStore.validationErrors.parsing,
                fieldStore.validationErrors.backend,
                fieldStore.validationErrors.runtime
            ].filter(maybeError => maybeError !== undefined);

            if (errors.length > 0) {
                return {
                    isValid: false,
                    error: errors[0]!
                };
            }

            return {
                isValid: true,
                value: fieldStore.value as any as ValidValue
            }
        },
        get isValid() {
            return !Boolean(fieldStore.validationErrors.parsing || fieldStore.validationErrors.backend || fieldStore.validationErrors.runtime)
        },
        [informalType]: 'valueContainer',
    })

    return fieldStore;
}

export const field = <Value>(validation?: Validator<Value>): Field<Value> => {
    const fieldStore = makeFormalField<Value | undefined, Value>({
        required: true,
        initialValue: undefined,
        validation: validation as any
    })

    return fieldStore;
}


field.optional = <Value>(validation?: Validator<Value>): Field<Value | undefined> => {
    const fieldStore = makeFormalField<Value | undefined, Value | undefined>({
        required: false,
        initialValue: undefined,
        validation: validation as any
    })

    return fieldStore;
}