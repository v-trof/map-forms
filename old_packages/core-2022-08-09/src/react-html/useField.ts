import React from "react";
import { Field } from "../form/field";
import { ShowError, showErrorOnInteractionEnd } from "./showError";

export type UseFieldOptions = { showError: ShowError }

const defaultOptions: UseFieldOptions = {
    showError: showErrorOnInteractionEnd
}

export const useField = <T>(field: Field<T>, options?: UseFieldOptions) => {
    const filledOptions = {...defaultOptions, ...options}
    
    return {
        value: field.value,
        setValue: (newValue: typeof field.value) => field.value = newValue,
        onInteractionStart: () => field.interactionStatus = 'active',
        onInteractionEnd: () => field.interactionStatus = 'wasActive',
        error: filledOptions.showError(field)
    }
}

export const useTextField = (field: Field<string>, options?: UseFieldOptions) => {
    const {value,setValue, onInteractionStart,onInteractionEnd,error} = useField(field, options);

    return {
        value,
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value.trim() || undefined),
        onFocus: onInteractionStart,
        onBlur: onInteractionEnd,
        error
    }
}