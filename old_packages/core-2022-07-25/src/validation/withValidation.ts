import { ErrorDisplayManager } from "./errorDisplayManager";
import { ValidationError, ValidationResult, Validator } from "./validationTypes";

export type WithValidationContext = {
    id: string;
    onRun: (errorManager: ErrorDisplayManager) => void;
    onError: (validationError: ValidationError) => void;
}

export type WithValidation<T> = {
    (): ValidationResult<T>;
    dispose: () => void;
}

export const withValidationContext: WithValidationContext = {
    id: 'none',
    onRun: () => { /* noop */ },
    onError: () => { /* noop */ }
}

let nextId = 0;

export const invalid = Symbol("Invalid, aborting");

export const withValidation = <T>(mapper: () => T | typeof invalid): WithValidation<T> => {
    const contextId = `withValidation ${++nextId}`;
    const affectedErrorManagers = new Set<ErrorDisplayManager>();
    let currentValidationError: ValidationError | undefined = undefined;

    const context: WithValidationContext = {
        id: contextId,
        onRun: (errorManager) => {
            affectedErrorManagers.add(errorManager);
        },
        onError: (validationError) => {
            currentValidationError = validationError;
        }
    }

    const run = (): ValidationResult<T> => {
        const lastContext = { ...withValidationContext };

        try {
            currentValidationError = undefined;
            Object.assign(withValidationContext, context);

            const value = mapper();

            Object.assign(withValidationContext, lastContext);

            if (currentValidationError || value === invalid) {
                const validationError = currentValidationError || { code: 'symbol invalid returned' };

                lastContext.onError(validationError);

                return {
                    isValid: false,
                    error: validationError
                }
            }

            return {
                isValid: true,
                value: value
            };
        } catch (error) {
            Object.assign(withValidationContext, lastContext);

            const validationError = { code: 'withValidaitonFaiedToExecute', params: error };
            lastContext.onError(validationError);

            return {
                isValid: false,
                error: validationError
            }
        }
    };

    run.dispose = () => {
        affectedErrorManagers.forEach(errorManager => errorManager.validationErrors[contextId] = undefined)
    }

    return run;
}

export type Validate<RawValue> = <ValidValue>(validator: Validator<RawValue, ValidValue>) => ValidationResult<ValidValue>;

export const makeValidate = <RawValue>(getRawValue: () => RawValue, errorManager: ErrorDisplayManager) => {

    const validate = <ValidValue>(validator: Validator<RawValue, ValidValue>): ValidationResult<ValidValue> => {
        withValidationContext.onRun(errorManager);

        const validationResult = validator(getRawValue());

        if (validationResult.isValid) {
            errorManager.validationErrors[withValidationContext.id] = undefined;
            return validationResult;
        }

        errorManager.validationErrors[withValidationContext.id] = validationResult.error;
        withValidationContext.onError(validationResult.error);

        return validationResult;
    }

    return validate;
}