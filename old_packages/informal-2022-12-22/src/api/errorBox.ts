import { ErrorBox, getError, isApproved, Validate } from './contract';

export const errorBox = (validate?: Validate<never>): ErrorBox => {
    return {
        [isApproved]: false,
        [getError]: () => undefined,
    };
};
