import {
    Input,
    isInvalidForm,
    submit,
    ExtractValue,
    ErrorBox,
} from '@informal/pkg';
import { action } from 'mobx';
import React, { useState } from 'react';

import { useTranslation } from './fakeNormalAppServices/useTranslation';

export const useTextInput = (
    input: Input<string> | Input<string | undefined>
) => {
    const t = useTranslation();
    const error = input.approved ? input.error : undefined;

    return {
        value: input.value || '',
        onChange: action(
            (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
                input.value = e.target.value || undefined; // required expects undefined
            }
        ),
        onBlur: action(() => {
            input.approved = true;
        }),
        error: error && t(error.message, error.params),
    };
};

export const useError = (errorBox: ErrorBox) => {
    const t = useTranslation();
    const error = errorBox.approved ? errorBox.error : undefined;

    return error && t(error.message, error.params);
};

export const useSubmit = <Store>(
    store: Store,
    onSubmit: (values: ExtractValue<Store>) => void | Promise<void>
) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    return {
        handleSubmit: async (e: React.FormEvent) => {
            e.preventDefault();

            const result = submit(store);

            if (!isInvalidForm(result)) {
                setIsSubmitting(true);
                try {
                    await onSubmit(result);
                } finally {
                    setIsSubmitting(false);
                }
            }
        },
        isSubmitting,
    };
};
