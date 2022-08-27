import { error, Validator } from "../protocol/error";

export function all<T>(...validators: Validator<T>[]): Validator<T> {
    return (value) => {
        for (const validator of validators) {
            const error = validator(value);

            if (error) {
                return error;
            }
        }

        return undefined;
    }
}

export const modifyError = <T>(validator: Validator<T>, message: string, params?: any): Validator<T> => (value) => {
    const maybeError = validator(value);

    if (maybeError) {
        return error(message, { ...maybeError.params, ...params })
    }
}