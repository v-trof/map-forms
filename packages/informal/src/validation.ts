export type Invalid = {
    message: string;
    params?: object;
};

export type Validate<Value> = (value: Value) => Invalid | undefined;

export const minLength = (min: number): Validate<string> => {
    return (value: string) => {
        if (value.length < min) {
            return { message: 'minLength', params: { min } };
        }
    };
};

export const min = (min: number): Validate<number> => {
    return (value) => {
        if (value < min) {
            return { message: 'min', params: { min } };
        }
    };
};
