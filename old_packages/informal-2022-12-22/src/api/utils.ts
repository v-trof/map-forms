import { ValidationError } from './contract';

export const error = (message: string, params?: object): ValidationError => {
    return { message, params };
};
