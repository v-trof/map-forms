import { ErrorDisplayManager } from "./errorDisplayManager";
import { ValidationError, Validator } from "./validationTypes";
import { withValidationContext, WithValidationContext } from "./withValidation";

let nextId = 0;

export const withValidationMagic = <T>(mapper: () => T) => {
    let currentValidationError: ValidationError | undefined = undefined;

    const onError: WithValidationContext['onError'] = (validationError) => {
        currentValidationError = validationError;
    }

    const contextId = `withValidationMagic ${++nextId}`;

    return (): T => {
        currentValidationError = undefined;

        let lastContextId = withValidationContext.id;
        let lastContextOnError = withValidationContext.onError;

        withValidationContext.id = contextId;
        withValidationContext.onError = onError;

        try {
            const value = mapper();

            withValidationContext.id = lastContextId;
            withValidationContext.onError = lastContextOnError;

            if (currentValidationError) {
                lastContextOnError(currentValidationError);
            }

            return value;
        } catch (error) {
            withValidationContext.id = lastContextId;
            withValidationContext.onError = lastContextOnError;

            lastContextOnError({ code: 'withValidaitonFaiedToExecute', params: error });

            return undefined as any;
        }
    }
}

export const makeMagicValid = <RawValue>(getRawValue: () => RawValue, errorManager: ErrorDisplayManager) => <ValidValue>(validator: Validator<RawValue, ValidValue>) => {
    const validationResult = validator(getRawValue());

    if (validationResult.isValid) {
        errorManager.validationErrors[withValidationContext.id] = undefined;
        return validationResult.value;
    }

    errorManager.validationErrors[withValidationContext.id] = validationResult.error;
    withValidationContext.onError(validationResult.error);

    return undefined as any;
}