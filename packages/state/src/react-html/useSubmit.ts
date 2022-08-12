import { useState } from "react";
import { autoSubmit, ReplaceFieldsWithValues } from "../form/form"

type MaybeError = 'error' | void;

export const fieldIsInvalidAttr = 'data-form-field-is-invalid';

export const focusFirstInvalidField = (form: HTMLElement, scrollRoot?: HTMLElement) => {
    const el = form.querySelector(`[${fieldIsInvalidAttr}="true"]`);

    if (!el) {
        return;
    }

    const input = el as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

    if (scrollRoot) {
        const scrollTop = scrollRoot.scrollTop;

        input.focus();
        scrollRoot.scrollTop = scrollTop;
    } else {
        const x = window.scrollX;
        const y = window.scrollY;

        input.focus();
        window.scrollTo(x, y);
    }

    if (input.scrollIntoView) {
        input.scrollIntoView({
            block: 'center',
            behavior: 'smooth'
        });
    } else {
        // scrollIntoView might be unavailable in testing environments & old browsers so focus to jump scroll to the input
        input.focus();
    }
};


export const useAutoSubmit = <Store>(
    store: Store,
    onSubmit: (value: ReplaceFieldsWithValues<Store>) => Promise<MaybeError> | MaybeError,
    options?: {
        onBeforeError: () => void | Promise<void>;
    }
) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        const result = autoSubmit(store);

        const onError = async () => {
            if (options?.onBeforeError) {
                await options?.onBeforeError();
            }
    
            if (e.target instanceof HTMLElement) {
                focusFirstInvalidField(e.target);
            }
        }

        if (result.isValid) {
            const submitResult = onSubmit(result.value);

            if (submitResult instanceof Promise) {
                setIsSubmitting(true);
                const maybeError = await submitResult;
                setIsSubmitting(false);
                
                if(maybeError) {
                    onError()
                }
            } else if(submitResult === 'error') {
                onError();
            }            
        } else {
            onError()
        }
    }

    return {
        onSubmit: handleSubmit, 
        isSubmitting
    };
};
