import { Check, Field, getErrorAfterInteraction } from "@informal/core";
import { action } from "mobx";
import React from "react";

export const useTextField = (field: Field<string> | Field<string | undefined>, t: (key: string, params?: any) => React.ReactNode) => {
    const error = getErrorAfterInteraction(field);

    return {
        value: field.value || '',
        onChange: action((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            field.interactionStatus = 'active';
            field.value = e.target.value || undefined; // required expects undefined
        }),
        onBlur: action(() => field.interactionStatus = 'wasActive'),
        error: error && t(error.message, error.params)
    };
}

/**
 * Based off text inputs since browsers handle numbers too differently
 * @returns 
 */
export const useNumber = (field: Field<number> | Field<number | undefined>, t: (key: string, params?: any) => React.ReactNode) => {
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

export const useSelect = <T extends string>(field: Field<T> | Field<T | undefined>, t: (key: string, params?: any) => React.ReactNode, id2Value?: { [id: string]: T }) => {
    const error = getErrorAfterInteraction(field);

    return {
        value: id2Value ? Object.entries(id2Value).find((([_key, v]) => field.value === v))?.[0] : field.value,
        onChange: action((e: React.ChangeEvent<HTMLSelectElement>) => {
            field.interactionStatus = 'wasActive';
            if (id2Value) {
                field.value = id2Value[e.target.value];
            }
            field.value = e.target.value as any || undefined; // required expects undefined
        }),
        onFocus: action(() => field.interactionStatus = 'active'),
        error: error && t(error.message, error.params)
    };
}

export const useCheck = (check: Check, t: (key: string, params?: any) => React.ReactNode) => {
    const error = getErrorAfterInteraction(check);

    return error && t(error.message, error.params);
}