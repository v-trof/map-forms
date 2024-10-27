import { action, observable } from 'mobx';

import {
    doSubmit,
    getError,
    isValidationError,
    ValidationError,
    WithApproval,
    WithError,
    WithSubmit,
} from './domain';

export type Validation = WithError;

type AccessContext = {
    onAccess: (isApproved: boolean) => void;
};
const informalGlobal: { accessContext: AccessContext } = {
    accessContext: {
        onAccess: () => undefined,
    },
};

export const claimAccessContext = (context: AccessContext) => {
    const prevContext = informalGlobal.accessContext;
    informalGlobal.accessContext = context;
    return () => {
        informalGlobal.accessContext = prevContext;
    };
};

export const reportApprovalStatus = (isApproved: boolean) => {
    informalGlobal.accessContext.onAccess(isApproved);
};

export const validation = (
    validator: () => ValidationError | undefined
): Validation => {
    const store: Validation = observable({
        [getError]: () => {
            let isApproved = true;
            const dispose = claimAccessContext({
                onAccess: (value) => {
                    isApproved = value && isApproved;
                },
            });

            try {
                // handle dependencies properly
                const result = validator();
                if (isValidationError(result)) {
                    return { ...result, approved: isApproved };
                }
                return undefined;
            } catch (e) {
                // this is questionable since invalid inputs have their own display
                if (isValidationError(e)) {
                    return { ...e, approved: false };
                }
                throw e;
            } finally {
                dispose();
            }
        },
    });

    return store;
};

export type ValidationBackend = WithApproval &
    WithError & {
        setError: (backendError: ValidationError | undefined) => void;
    } & WithSubmit<void>;

export const ValidationBackend = (): ValidationBackend => {
    const store = observable({
        backendError: undefined as ValidationError | undefined,
        approved: false,
        setError: action((backendError: ValidationError | undefined) => {
            store.backendError = backendError;
            store.approved = true;
        }),
        [doSubmit]: () => {
            store.backendError = undefined;
            store.approved = false;
        },
        [getError]: () => store.backendError,
    });

    return store;
};
