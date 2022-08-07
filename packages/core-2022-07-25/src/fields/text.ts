import { makeAutoObservable } from "mobx";
import { alwaysVisibleError, ErrorDisplayManager } from "../validation/errorDisplayManager";
import { makeValidate, Validate } from "../validation/withValidation";

type TextValue = string | undefined;
type TextState = {
    value: TextValue;
    onChange: (newValue: TextValue) => void;

    onBlur: () => void;
};

export type Text = {
    state: TextState;
    errorManager: ErrorDisplayManager;
    validate: Validate<TextValue>;
}

const normalize = (value: TextValue) => value?.trim() || undefined

export const text = (): Text => {
    const errorManager = alwaysVisibleError();

    const state: TextState = makeAutoObservable({
        value: undefined,
        onChange: (newValue) => {
            state.value = newValue;
            errorManager.interactionStatus = 'isActive';
        },
        onBlur: () => errorManager.interactionStatus = 'wasActive'
    });

    const validate = makeValidate(() => normalize(state.value), errorManager);

    const field: Text = makeAutoObservable({
        state,
        errorManager,
        validate
    })

    return field;
}