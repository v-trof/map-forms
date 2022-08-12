import { ValidationError, ValidationResult } from "./validation/validationTypes";

export const informalType = Symbol('informalType');
export type InformalType = typeof informalType;

export type ValueContainer<Value> = {
    getValidValue: () => ValidationResult<Value>;
    [informalType]: 'valueContainer';
}

export type ValidationContainer = {
    getError: () => ValidationError | undefined;
    [informalType]: 'validationContainer';
}

export type AutoSubmitSkip = {
    [informalType]: 'autoSubmitSkip';
}

export type RemoveEmptyKeys<T extends object> = { [P in keyof T as T[P] extends undefined ? never : P]: T[P] };

export type RemoveEmptyObject<T extends object> = T extends { [key: string]: undefined } ? undefined : T;

export type ExtractValues<Store> = Store extends ValueContainer<infer Value>
    ? Value
    : Store extends ValidationContainer ? undefined
    : Store extends AutoSubmitSkip ? undefined
    : Store extends Array<any> ? Array<ExtractValues<Store[number]>>
    : Store extends object ? RemoveEmptyObject<RemoveEmptyKeys<{ [K in keyof Store]: ExtractValues<Store[K]> }>> : undefined;

export type AutoSubmit<State> = (state: State) => ValidationResult<ExtractValues<State>>

const isValueContainer = (state: unknown): state is ValueContainer<any> => {
    if(state && typeof state === 'object' && informalType in state && (state as any)[informalType] === 'valueContainer') {
        return true;
    }

    return false;
}

const isValidationContainer = (state: unknown): state is ValidationContainer => {
    if(state && typeof state === 'object' && informalType in state && (state as any)[informalType] === 'validationContainer') {
        return true;
    }

    return false;
}

const isAutoSubmitSkip = (state: unknown): state is AutoSubmitSkip => {
    if(state && typeof state === 'object' && informalType in state && (state as any)[informalType] === 'autoSubmitSkip') {
        return true;
    }

    return false;
}

const tryExtract = (value: unknown): ValidationResult<any> | undefined => {
    if(isAutoSubmitSkip(value)) {
        return undefined;
    }

    if(isValueContainer(value)) {
        return value.getValidValue();
    }

    if(isValidationContainer(value)) {
        const error = value.getError();

        if(error) {
            return {
                isValid: false,
                error
            }
        }

        return undefined
    }

    if(Array.isArray(value)) {
        const result = [] as any;
        
        for(const item of value) {
            const itemResult = tryExtract(item);
            if(itemResult && itemResult.isValid === false) {
                return itemResult;
            }

            result.push(itemResult);
        }
        
        return { isValid: true, value: result }
    }

    if(value && typeof value === 'object') {
        const result = {} as any; 

        for(const key in value) {
            const itemResult = tryExtract((value as any)[key]);
            if(itemResult && itemResult.isValid === false) {
                return itemResult;
            }

            if(itemResult?.isValid) {
                result[key] = itemResult.value;
            }
        }

        if(Object.keys(result.length > 0)) {
            return { isValid: true, value: result };
        }
    }

    return undefined;
}

export const autoSubmit =<State>(state: State): ValidationResult<ExtractValues<State>> => {    
    const result = tryExtract(state);

    if(!result) {
        console.error("No fields in submitted state", state);
        return { isValid: false, error: { message: "No fields in state"} };
    }

    return result;
}