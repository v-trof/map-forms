import { Check } from "../form/field";
import { ShowError, showErrorOnInteractionEnd } from "./showError";

export type UseCheckOptions = { showError: ShowError }

const defaultOptions: UseCheckOptions = {
    showError: showErrorOnInteractionEnd
}

export const useCheck = (check: Check, options?: UseCheckOptions) => {
    const filledOptions = {...defaultOptions, ...options}
    
    return {
        error: filledOptions.showError(check)
    }
}
