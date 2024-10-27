import {
    Input as InputType,
    submit,
    ExtractValidValue,
    isValidationError,
    extractError,
    Validation as ValidationType,
} from '@informal/pkg';
import { Input } from 'antd';
import { action } from 'mobx';
import { observer } from 'mobx-react-lite';
import React, { useState } from 'react';
import { z, ZodOptional } from 'zod';

import { useTranslation } from './fakeNormalAppServices/useTranslation';

const InputWithLabel = ({
    label,
    error,
    ...props
}: {
    label: string | undefined;
    error: string | false | undefined;
} & React.ComponentProps<typeof Input>) => (
    <>
        {label && <label>{label}</label>}
        <Input {...props} />
        {error && <div style={{ color: 'red' }}>{error}</div>}
    </>
);

export const TextInput = observer(
    ({
        label,
        store,
    }: {
        label: string | undefined;
        store: InputType<z.ZodString> | InputType<ZodOptional<z.ZodString>>;
    }) => {
        const t = useTranslation();
        const error = extractError(store);
        const value = store.value || '';
        const onChange = action(
            (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
                store.approved = false;
                store.value = e.target.value || undefined; // required expects explicit undefined
            }
        );

        const onBlur = action(() => {
            store.approved = true;
        });

        return (
            <InputWithLabel
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                error={error?.approved && t(error.message, error.params)}
                label={label}
            />
        );
    }
);

export const Validation = observer(({ store }: { store: ValidationType }) => {
    const t = useTranslation();
    const error = extractError(store);

    const visibleError = error?.approved && t(error.message, error.params);

    return visibleError ? (
        <div style={{ color: 'red' }}>{visibleError}</div>
    ) : null;
});

const defaultOptions = {
    logFailedSubmit: true,
};

export const useSubmit = <Store extends object>(
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
