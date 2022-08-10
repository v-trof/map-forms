import { ValidationError, ValidationResult } from "../validation/validationTypes";

export type BaseField<Value> = {
    getValidValue: () => Value;
    __isMapFormsField: true;
}

export type NoTraverse = {
    __isMapFormsNoTraverse: true;
}

export type RemoveEmptyKeys<T> = T extends object ? { [P in keyof T as T[P] extends undefined ? never : P]: T[P] } : T;

export type RemoveEmptyObject<T> = T extends { [key: string]: undefined } ? undefined : T;

export type ReplaceFieldsWithValues<Store> = Store extends BaseField<infer Value>
    ? Value
    : Store extends NoTraverse ? undefined
    : Store extends Array<any> ? Array<ReplaceFieldsWithValues<Store[number]>>
    : Store extends object ? RemoveEmptyKeys<{ [K in keyof Store]: RemoveEmptyObject<ReplaceFieldsWithValues<Store[K]>> }> : undefined;

export type AutoSubmit<State> = () => ReplaceFieldsWithValues<State> | ValidationError

// maybe we even do not need form as an entity
// this is like about it
export const autoSubmit = <Store>(store: Store) => {
    type Result = ValidationResult<ReplaceFieldsWithValues<Store>>;

    return 0 as any as Result
};

// state is passed to ensure that we can visit every field and provide status to it
export const makeSubmit = <Value>(getState: () => object, getValue: () => Value): () => ValidationResult<Value> => 0 as any;