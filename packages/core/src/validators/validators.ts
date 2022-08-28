import { error, Validator } from "../protocol/error";


export const required = <RawValue>(
    value: RawValue | undefined
) => {
    if (value === undefined) {
        return error('error.required');
    }
};

export const minLength = (min: number): Validator<string> => (value) => {
    if (value.length < min) {
        return error('error.minLength', { min });
    }
};

export const maxLength = (max: number): Validator<string> => (value) => {
    if (value.length > max) {
        return error('error.maxLength', { max });
    }
};

export const inRange = (min: number, max: number): Validator<number> => (value) => {
    if (value < min || value > max) {
        return error('error.range', { min, max });
    }
};

export const minValue = (min: number): Validator<number> => (value) => {
    if (value < min) {
        return error('error.min', { min });
    }
};

export const maxValue = (max: number): Validator<number> => (value) => {
    if (value > max) {
        return error('error.max', { max });
    }
};

export const noEmoji: Validator<string> = (value) => {
    if (value.includes('🍆')) {
        return error('come on man')
    }
};