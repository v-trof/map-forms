import { ValidationError } from "../validation/validationTypes";

export type BaseField<Value> = {
    getValidValue: () => Value;
    __isMapFormsField: true;
}

export type Check = {
    validationErrors: {
        validator: ValidationError | undefined;
        backend: ValidationError | undefined;
    };
    interactionStatus: 'new' | 'active' | 'wasActive';
    __isMapFormsCheck: true;
}

// consider making it less verbse later
export type Field<Value> = BaseField<Value> & {
    value: Value | undefined;
    validationErrors: {
        parse: ValidationError | undefined;
        requried: ValidationError | undefined;
        validator: ValidationError | undefined;
        backend: ValidationError | undefined;
    };
    interactionStatus: 'new' | 'active' | 'wasActive';
}

type IdxOf<T extends any[]> = Exclude<keyof T, keyof any[]>

export type RemoveEmptyKeys<T> = T extends object ? { [P in keyof T as T[P] extends undefined ? never : P]: T[P] } : T;

export type RemoveEmptyObject<T> = T extends { [key: string]: undefined } ? undefined : T;

export type ReplaceFieldsWithValues<T> = T extends BaseField<infer Value>
    ? Value
    : T extends Check ? undefined
    : T extends Array<any> ? Array<ReplaceFieldsWithValues<T[number]>>
    : T extends object ? RemoveEmptyKeys<{ [K in keyof T]: RemoveEmptyObject<ReplaceFieldsWithValues<T[K]>> }> : undefined;

export type Signup = {
    name: Field<string>;
    password: Field<string>;
    noSame: Check;
}

export type WithState = {
    name: Field<string>;
    password: Field<string>;
    state: {
        magic: number;
        weird: string;
    },
    ud: undefined;
    op: number | undefined;
    rq: number;
}

type B = WithState['ud'] extends undefined ? true : false;
type B1 = undefined extends WithState['ud'] ? true : false;

type C = WithState['op'] extends undefined ? true : false;
type C1 = undefined extends WithState['op'] ? true : false;

type D = WithState['rq'] extends undefined ? true : false;
type D1 = undefined extends WithState['rq'] ? true : false;

// traverse types work but are kinda shitty
type SV = ReplaceFieldsWithValues<Signup>;
type WSV = ReplaceFieldsWithValues<WithState>;
type PR = ReplaceFieldsWithValues<{
    title: Field<string>,
    price: {
        range: [Field<number>, Field<number>]
    }
}>



export type Form<State, ValidValue> = {

}