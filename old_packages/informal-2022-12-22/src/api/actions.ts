import { ExtractValueValid, ValidationError } from './contract';

export type SubmitFailureReport = { [path: string]: ValidationError };
export type SubmitResult<Store> =
    | { isValid: true; value: ExtractValueValid<Store> }
    | { isValid: false; report: SubmitFailureReport };

export const submit = <Store>(store: Store): SubmitResult<Store> => {
    store;
    return { isValid: false, report: {} };
};
