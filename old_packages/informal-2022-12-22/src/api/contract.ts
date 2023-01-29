// symbols: value
export const getValueValid = Symbol('@informal/getValueValid');
export const getValueCurrent = Symbol('@informal/getValueCurrent');
export const getValueRaw = Symbol('@informal/getValueRaw'); // for parsed inputs

// symbols: validations & error display
export const getError = Symbol('@informal/getError'); // like getValueValid but 100% without value
export const isApproved = Symbol('@informal/isApproved');

// symbols: utility
export const isRemoved = Symbol('@informal/isRemoved');
export const skip = Symbol('@informal/skip'); // prevent informal traversing this store and below. Good for perf.

// extract value
export type ExtractValueValid<Store> = Store extends {
    [getValueValid]: () => infer V;
}
    ? V
    : never;
export type ExtractValueCurrent<Store> = Store extends {
    [getValueCurrent]: () => infer V;
}
    ? V
    : never;
export type ExtractValueRaw<Store> = Store extends {
    [getValueRaw]: () => infer V;
}
    ? V
    : never;

// validation
export type ValidationError = {
    message: string;
    params?: object;
};

export type Validate<Value> = (value: Value) => ValidationError | undefined;

export type ErrorBox = {
    [isApproved]: boolean;
    [getError]: () => ValidationError | undefined;
};
