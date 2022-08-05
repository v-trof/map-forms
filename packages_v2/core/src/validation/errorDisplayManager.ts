import { makeAutoObservable } from "mobx";
import { ValidationError } from "./validationTypes";

export type ErrorDisplayManager = {
    interactionStatus: "new" | "isActive" | "wasActive";
    formSubmitStatus: "beforeFirstSubmit" | "afterFirstSubmit";
    validationErrors: {
        [context: string]: ValidationError | undefined
    };
    visibleError?: ValidationError;
};

export const alwaysVisibleError = () => {
    const manager: ErrorDisplayManager = makeAutoObservable({
        interactionStatus: "isActive",
        formSubmitStatus: "afterFirstSubmit",
        validationErrors: {},
        get visibleError() {
            const error = Object.values(manager.validationErrors).find(x => x !== undefined)
            return error;
        }
    });

    return manager;
};
