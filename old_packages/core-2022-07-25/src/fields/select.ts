import { makeAutoObservable } from "mobx";
import { alwaysVisibleError, ErrorDisplayManager } from "../validation/errorDisplayManager";
import { makeValidate, Validate } from "../validation/withValidation";

type SelectState<Value> = {
    value: Value | undefined;
    onChange: (newValue: Value | undefined) => void;

    onMenuOpen: () => void;
    onMenuClose: () => void;
};

export type Select<Value> = {
    state: SelectState<Value>;
    errorManager: ErrorDisplayManager;
    validate: Validate<Value | undefined>;
}

export const select = <Value = unknown>(): Select<Value> => {
    const errorManager = alwaysVisibleError();

    const state: SelectState<Value> = makeAutoObservable({
        value: undefined,
        onMenuOpen: () => errorManager.interactionStatus = 'isActive',
        onMenuClose: () => errorManager.interactionStatus = 'wasActive',
        onChange: (newValue) => state.value = newValue,
    });

    const validate = makeValidate(() => state.value, errorManager);

    const field: Select<Value> = makeAutoObservable({
        state,
        errorManager,
        validate
    })

    return field;
}