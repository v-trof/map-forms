import { ValidationError, ValidationResult } from "./validation/validationTypes";

export const submitIgnore = Symbol('@informal/submitIgnore');
export const submit = Symbol('@informal/submit');
export const getError = Symbol('@informal/getError');
export type InformalType = typeof submitIgnore;

export type Submittable<Value> = {
    [submit]: () => ValidationResult<Value>;
}

export type ValidationContainer = {
    [getError]: () => ValidationError | undefined;
}

export type AutoSubmitSkip = {
    [submitIgnore]: true;
}

export type RemoveEmptyKeys<T extends object> = { [P in keyof T as T[P] extends undefined ? never : P]: T[P] };

export type RemoveEmptyObject<T extends object> = T extends { [key: string]: undefined } ? undefined : T;

export type ExtractValues<Store> = Store extends Submittable<infer Value>
    ? Value
    : Store extends ValidationContainer ? undefined
    : Store extends AutoSubmitSkip ? undefined
    : Store extends Array<any> ? Array<ExtractValues<Store[number]>>
    : Store extends object ? RemoveEmptyObject<RemoveEmptyKeys<{ [K in keyof Store]: ExtractValues<Store[K]> }>> : undefined;

export type AutoSubmit<State> = (state: State) => ValidationResult<ExtractValues<State>>

const canBeSubmitted = (state: unknown): state is Submittable<any> => {
    if (state && typeof state === 'object' && submit in state) {
        return true;
    }

    return false;
}

const canBlockSubmit = (state: unknown): state is ValidationContainer => {
    if (state && typeof state === 'object' && getError in state) {
        return true;
    }

    return false;
}

const shouldBeSkipped = (state: unknown): state is AutoSubmitSkip => {
    if (state && typeof state === 'object' && submitIgnore in state) {
        return true;
    }

    return false;
}

const tryExtract = (value: unknown): ValidationResult<any> | undefined => {
    if (shouldBeSkipped(value)) {
        return undefined;
    }

    if (canBeSubmitted(value)) {
        return value[submit]();
    }

    if (canBlockSubmit(value)) {
        const error = value[getError]();

        if (error) {
            return {
                isValid: false,
                error
            }
        }

        return undefined
    }

    if (Array.isArray(value)) {
        const result = [] as any;
        let badResult: ValidationResult<any> | undefined;

        for (const item of value) {
            const itemResult = tryExtract(item);
            if (itemResult && itemResult.isValid === false) {
                badResult = itemResult;
            }

            result.push(itemResult);
        }

        if(badResult) {
            return badResult;
        }

        return { isValid: true, value: result }
    }

    if (value && typeof value === 'object') {
        const result = {} as any;
        let badResult: ValidationResult<any> | undefined;

        for (const key in value) {
            const itemResult = tryExtract((value as any)[key]);
            if (itemResult && itemResult.isValid === false) {
                badResult = itemResult;
            }

            if (itemResult?.isValid) {
                result[key] = itemResult.value;
            }
        }

        if(badResult) {
            return badResult;
        }

        if (Object.keys(result.length > 0)) {
            return { isValid: true, value: result };
        }
    }

    return undefined;
}

export const autoSubmit = <State>(state: State): ValidationResult<ExtractValues<State>> => {
    const result = tryExtract(state);

    if (!result) {
        console.error("No fields in submitted state", state);
        return { isValid: false, error: { message: "No fields in state" } };
    }

    return result;
}