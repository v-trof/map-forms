import {
    Input,
    submit,
    ExtractValidValue,
    getError,
    isValidationError,
} from '@informal/pkg';
import { action } from 'mobx';
import React, { useState } from 'react';
import { z, ZodOptional } from 'zod';

import { useTranslation } from './fakeNormalAppServices/useTranslation';

export const useTextInput = (
    input: Input<z.ZodString | ZodOptional<z.ZodString>>
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

// export const useSelect = <T>(
//     input: Input<T>,
//     options: { key: string; value: T }[]
// ) => {
//     const t = useTranslation();
//     const error = input.approved ? input[getError]() : undefined;

//     return {
//         value:
//             input.value === undefined
//                 ? undefined
//                 : options.find((op) => op.key === input.value)?.key,
//         onClick: action(() => {
//             input.approved = false;
//         }),
//         onChange: action((e: React.ChangeEvent<HTMLSelectElement>) => {
//             input.approved = true;
//             const chosen = options.find((op) => op.key === e.target.value);
//             input.value = chosen?.value;
//         }),
//         error: error && t(error.message, error.params),
//     };
// };

const defaultOptions = {
    logFailedSubmit: true,
};

export const useSubmit = <Store>(
    store: Store,
    onSubmit: (values: ExtractValidValue<Store>) => void | Promise<void>,
    options = {}
) => {
    const finalOptions = { ...defaultOptions, ...options };
    const [isSubmitting, setIsSubmitting] = useState(false);

    return {
        handleSubmit: async (e: React.FormEvent) => {
            e.preventDefault();

            const result = submit(store);

            if (!isValidationError(result)) {
                setIsSubmitting(true);
                try {
                    await onSubmit(result);
                } finally {
                    setIsSubmitting(false);
                }
            } else if (finalOptions.logFailedSubmit) {
                console.error('Failed to submit', result.params);
            }
        },
        isSubmitting,
    };
};
