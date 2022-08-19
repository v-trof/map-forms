import { Check, Field, getErrorAfterInteraction } from "@informal/state-mobx";
import { autoSubmit, ExtractValues } from "@informal/state-mobx/src/submit";
import { action } from "mobx";
import React, { useState } from "react";
import { useTranslation } from "../../fakeNormalAppServices/useTranslation";

export const useTextField = (field: Field<string> | Field<string | undefined>) => {
    const t = useTranslation();
    const error = getErrorAfterInteraction(field);

    return {
        value: field.value || '',
        onChange: action((e: React.ChangeEvent<HTMLInputElement>) => {
            field.interactionStatus = 'active';
            field.value = e.target.value || undefined; // required expects undefined
        }),
        onBlur: action(() => field.interactionStatus = 'wasActive'),
        error: error && t(error.message, error.params)
    };
}

export const useCheck = (check: Check) => {
    const t = useTranslation();
    const error = getErrorAfterInteraction(check);
    
    return error && t(error.message, error.params);
}

export const useSubmit = <Store>(store: Store, onSubmit: (values: ExtractValues<Store>) => void | Promise<void>) => {  
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    return {
        handleSubmit: async (e: React.FormEvent) => {
            e.preventDefault();

            const result = autoSubmit(store);

            if(result.isValid) {
                setIsSubmitting(true);
                try {
                    await onSubmit(result.value);
                } finally {
                    setIsSubmitting(false);
                }
            }
        },
        isSubmitting
    }
}