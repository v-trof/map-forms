import {
    getValueCurrent,
    getValueRaw,
    getValueValid,
    isApproved,
    isRemoved,
    Validate,
} from './contract';

export type Field<Value> = {
    value: Value | undefined;
    [isApproved]: boolean;
    [getValueValid]: () => Value;
    [getValueCurrent]: () => Value | undefined;
};

export type Removable<F extends Field<unknown>> = F & {
    [isRemoved]: boolean;
    [getValueValid]: () => undefined;
};

export type Optional<F extends Field<unknown>> = F & {
    [getValueValid]: () => undefined;
};

export type Parsed<F extends Field<unknown>, RawValue> = F & {
    rawValue: RawValue;
    [getValueRaw]: () => RawValue;
};

// we allow it to be complex since we expect it to be rarely used. Default field / Parsed is a lot more common;
export type Strict<F extends Field<unknown>> = Omit<
    F,
    'value' | typeof getValueCurrent
> & {
    value: Exclude<F['value'], undefined>;
    [getValueCurrent]: Exclude<F['value'], undefined>;
};

export const field = <Value>(validate?: Validate<Value>): Field<Value> => {
    return validate as any;
};

field.strict = <Value>(
    initialValue: Value,
    validate?: Validate<Value>
): Strict<Field<Value>> => {
    return validate as any;
};
