import { autoSubmit, ExtractValues } from "../submit";
import { ValidationResult } from "../validation/validationTypes";

export const modifyValid = <Value, NewValue>(result: ValidationResult<Value>, changeValue: (value: Value) => NewValue): ValidationResult<NewValue> => {
    if (result.isValid) {
        return {
            isValid: true,
            value: changeValue(result.value)
        }
    }

    return result;
}

export const modifySubmit = <Store, NewValue>(store: Store, changeValue: (value: ExtractValues<Store>) => NewValue): ValidationResult<NewValue> => {
    const result = autoSubmit(store);

    if (result.isValid) {
        return {
            isValid: true,
            value: changeValue(result.value)
        }
    }

    return result;
}