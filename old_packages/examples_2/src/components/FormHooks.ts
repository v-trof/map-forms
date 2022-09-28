import { check, Check, error, Field, getErrorAfterInteraction } from "@informal/core";
import { action } from "mobx";
import React, { ChangeEvent, useEffect, useRef, useState } from "react";
import { useTranslation } from "../fakeNormalAppServices/useTranslation";

export const useTextField = (field: Field<string> | Field<string | undefined>) => {
    const t = useTranslation();
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

export const useSelect = <T extends string>(field: Field<T> | Field<T | undefined>, id2Value?: { [id: string]: T }) => {
    const t = useTranslation();
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

export const useCheck = (check: Check) => {
    const t = useTranslation();
    const error = getErrorAfterInteraction(check);

    return { error: error && t(error.message, error.params) }
}


/**
 * Based off text inputs since browsers handle numbers too differently
 */
 export const useNumber = (field: Field<number> | Field<number | undefined>) => {
    const t = useTranslation();
    const errorToShow = getErrorAfterInteraction(field);

    const [stringValue, setStringValue] = useState(String(field.value ?? ''));
    const lastParsedValue = useRef<number | undefined>(field.value);

    const handleChange = action((e: ChangeEvent<HTMLInputElement>) => {
        field.interactionStatus = 'active';

        const value = e.target.value;
        setStringValue(value);

        const parsedValue = parseInt(value, 10);

        if(Number.isNaN(parsedValue)) {
            lastParsedValue.current = undefined;
            field.value = undefined;
            field.validationErrors.parsing = error('parseFalied');
        } else {
            lastParsedValue.current = parsedValue;
            field.value = parsedValue;
        }
    })

    useEffect(() => {
        if(field.value !== lastParsedValue.current) {
            lastParsedValue.current = field.value ;
            setStringValue(field.value  ? field.value.toString() : '');
        }
    }, [field.value])

    return {
        value: stringValue,
        onChange: handleChange,
        onBlur: action(() => field.interactionStatus = 'wasActive'),
        error: errorToShow && t(errorToShow.message, errorToShow.params)
    };
}