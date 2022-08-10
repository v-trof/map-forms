import { ValidationError } from "../validation/validationTypes";
import { BaseField, NoTraverse, ReplaceFieldsWithValues } from "./form";

export type Check = {
    validationErrors: {
        validator: ValidationError | undefined;
        backend: ValidationError | undefined;
    };
    interactionStatus: 'new' | 'active' | 'wasActive';
} & NoTraverse;

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

export const field: <T>() => Field<T> = 0 as any;
export const check: (validator: () => ValidationError | undefined) => Check = 0 as any;