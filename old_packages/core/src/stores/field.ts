import { getValue, Removable } from "../protocol/accessAnnotations";
import { ValidationError, Validator } from "../protocol/error";
import { makeBaseField } from "./baseField";

// we do a re-write insted of using baseField generic to avoid long typescript errors in consumer code
export interface Field<Value> {
    value: Value | undefined;
    validationErrors: {
        parsing: ValidationError | undefined;
        runtime: ValidationError | undefined;
        backend: ValidationError | undefined;
    };
    interactionStatus: 'new' | 'active' | 'wasActive';
    isValid: boolean;
    [getValue]: () => ValidationError | Value;
}

export const field = <Value>(validator?: Validator<Value>): Field<Value> => {
    const fieldStore = makeBaseField<Value | undefined, Value>({
        required: true,
        initialValue: undefined,
        runtimeValidator: validator
    })

    return fieldStore;
}

field.removable = <Value>(validator?: Validator<Value>): Field<Value> & Removable => {
    const fieldStore = makeBaseField<Value | undefined, Value>({
        required: true,
        initialValue: undefined,
        runtimeValidator: validator
    })

    return fieldStore;
}

const optional = <Value>(validator?: Validator<Value>): Field<Value | undefined> => {
    const fieldStore = makeBaseField<Value | undefined, Value | undefined>({
        required: false,
        initialValue: undefined,
        runtimeValidator: validator
    })

    return fieldStore;
}

optional.removable = <Value>(validator?: Validator<Value>): Field<Value | undefined> & Removable => {
    const fieldStore = makeBaseField<Value | undefined, Value | undefined>({
        required: false,
        initialValue: undefined,
        runtimeValidator: validator
    })

    return fieldStore;
}

field.optional = optional;

export type NeverEmptyField<Value> = {
    value: Value;
    validationErrors: {
        parsing: ValidationError | undefined;
        runtime: ValidationError | undefined;
        backend: ValidationError | undefined;
    };
    isValid: boolean;
    interactionStatus: 'new' | 'active' | 'wasActive';
    [getValue]: () => ValidationError | Value;
}

const neverEmpty = <Value>(initialValue: Value, validator?: Validator<Value>): NeverEmptyField<Value> => {
    const fieldStore = makeBaseField<Value, Value>({
        required: true,
        initialValue,
        runtimeValidator: validator
    })

    return fieldStore;
}

neverEmpty.removable = <Value>(initialValue: Value, validator?: Validator<Value>): NeverEmptyField<Value> & Removable => {
    const fieldStore = makeBaseField<Value, Value>({
        required: true,
        initialValue,
        runtimeValidator: validator
    })

    return fieldStore;
}

field.neverEmpty = neverEmpty;