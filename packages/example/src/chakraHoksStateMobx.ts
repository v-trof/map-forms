import {
    Input,
    isInvalidForm,
    submit,
    ExtractValue,
    ErrorBox,
    getError,
} from '@informal/pkg';
import { action } from 'mobx';
import React, { useState } from 'react';

import { useTranslation } from './fakeNormalAppServices/useTranslation';

export const useTextInput = (
    input: Input<string> | Input<string | undefined>
) => {
    const t = useTranslation();
    const error = input.approved ? input[getError]() : undefined;

    return {
        value: input.value || '',
        onChange: action(
            (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
                input.approved = false;
                input.value = e.target.value || undefined; // required expects explicit undefined
            }
        ),
        onBlur: action(() => {
            input.approved = true;
        }),
        error: error && t(error.message, error.params),
    };
};

export const useSelect = <T>(
    input: Input<T>,
    options: { key: string; value: T }[]
) => {
    const t = useTranslation();
    const error = input.approved ? input[getError]() : undefined;

    return {
        value:
            input.value === undefined
                ? undefined
                : options.find((op) => op.key === input.value)?.key,
        onClick: action(() => {
            input.approved = false;
        }),
        onChange: action((e: React.ChangeEvent<HTMLSelectElement>) => {
            input.approved = true;
            const chosen = options.find((op) => op.key === e.target.value);
            input.value = chosen?.value;
        }),
        error: error && t(error.message, error.params),
    };
};

export const useError = (errorBox: ErrorBox) => {
    const t = useTranslation();
    const error = errorBox.approved ? errorBox[getError]() : undefined;

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
