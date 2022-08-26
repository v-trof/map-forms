export const submit = Symbol('@informal/submit');
export const getValue = Symbol('@informal/getValue');
export const getError = Symbol('@informal/getError');
export const setInteractionEnd = Symbol('@informal/setInteractionEnd');
export const noSubmit = Symbol('@informal/submitIgnore');

export type ValidationError = { message: string; params?: any };

export type Validator<Value> = (
    value: Value
) => ValidationError | undefined;


// Ideally I would like to avoid both ValidationResult & ValidationError
// maybe make error a symbol too?
export type ValueContainer<Value> = {
    [getValue]: () => ValidationError | Value;
}

export type ValidationContainer = {
    [getError]: () => ValidationError | undefined;
}

export type AutoSubmitSkip = {
    [noSubmit]: true;
}