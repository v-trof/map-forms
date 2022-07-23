import { makeAutoObservable } from "mobx";
import { alwaysVisibleError, ErrorDisplayManager } from "../validation/errorDisplayManager";
import { ValidationResult } from "../validation/validationTypes";
import { makeValidate, Validate } from "../validation/withValidation";

type NumericState = {
    value: string | undefined;
    parsedValue: number | undefined;
    onChange: (newValue: string | undefined) => void;

    onBlur: () => void;
};

export type NumericOptions = {
    type: 'float' | 'int'
}

export type Numeric = {
    state: NumericState;
    errorManager: ErrorDisplayManager;
    validate: Validate<number | undefined>;
}

const parse = (value: string | undefined, options: NumericOptions): ValidationResult<number | undefined> => {
    const trimmedValue = value?.trim() || undefined;
    if (trimmedValue === undefined) {
        return {
            isValid: true,
            value: undefined
        };
    }
    try {
        if (options.type === 'int') {
            return {
                isValid: true,
                value: parseInt(trimmedValue, 10)
            }
        }

        return {
            isValid: true,
            value: parseFloat(trimmedValue)
        }
    } catch (error) {
        return {
            isValid: false,
            error: { code: 'invalid-number' }
        }
    }
}

export const numeric = (options: NumericOptions): Numeric => {
    const errorManager = alwaysVisibleError();

    const state: NumericState = makeAutoObservable({
        value: undefined,
        get parsedValue() {
            const parseResult = parse(state.value, options);

            if (parseResult.isValid) {
                return parseResult.value;
            }

            errorManager.validationErrors['parse'] = parseResult.error;

            return undefined;
        },
        onChange: (newValue) => {
            state.value = newValue;
            errorManager.interactionStatus = 'isActive';
        },
        onBlur: () => errorManager.interactionStatus = 'wasActive'
    });

    const validate = makeValidate(() => state.parsedValue, errorManager);

    const field: Numeric = makeAutoObservable({
        state,
        errorManager,
        validate
    })

    return field;
}