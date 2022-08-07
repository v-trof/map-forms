import { makeAutoObservable, makeObservable, observable } from "mobx";
import { required } from "./validation/validators";
import { ValidationError, ValidationResult, Validator } from "./validation/validationTypes";

export type Errors = {
    [context: string]: ValidationError | undefined
};

export type FieldIntractionStatus = 'new' | 'active' | 'wasActive';
export type FormIntractionStatus = 'new' | 'wasSubmitted';

export type BaseField<Value> = {
    value: Value;
    validationErrors: Errors;
    interactionStatus: FieldIntractionStatus;
}

export type Field<T> = BaseField<T | undefined>;
type FieldOptions<T> = {
    optional: boolean;
    validator: Validator<T>;
}

const defaultOptions: FieldOptions<any> = {
    optional: false,
    validator: (value: unknown) => ({ isValid: true, value })
}

export const field = <T>(validatorOrOptions: Validator<T> | FieldOptions<T>): Field<T> => {
    let options: FieldOptions<T> = defaultOptions;

    if (typeof validatorOrOptions === 'object') {
        options = validatorOrOptions;
    } else {
        options = { ...options, validator: validatorOrOptions }
    }

    const fieldStore: Field<T> = makeObservable({
        value: undefined,
        validationErrors: {
            get runtime() {
                const requiredResult = required(fieldStore.value);

                if (requiredResult.isValid === false) {
                    return options.optional ? undefined : requiredResult.error;
                }

                const validationResult = options.validator(requiredResult.value);
                return validationResult.isValid ? undefined : validationResult.error
            }
        },
        interactionStatus: 'new'
    }, {
        value: observable.ref,
        validationErrors: observable.shallow,
        interactionStatus: observable.ref
    })

    return fieldStore;
}