import { alwaysVisibleError, ErrorDisplayManager } from "./errorDisplayManager";
import { makeValidate, Validate } from "./withValidation";

export type ValidationMessage = {
    errorManager: ErrorDisplayManager;
    validate: Validate<unknown>;
}

export const validationMessage = (): ValidationMessage => {
    const errorManager = alwaysVisibleError();

    return {
        errorManager,
        validate: makeValidate(() => 0, errorManager)
    }
}