import { computed, makeAutoObservable } from 'mobx';

import { ErrorBox, getError, setApproved, Validator } from './domain';
import { claimReadContext } from './reader/readContext';

export const errorBox = (validator?: Validator<undefined>) => {
    const lastCall = computed(() => {
        if (!validator) {
            return { approved: true, error: undefined };
        }

        let success = true;
        const approvals: boolean[] = [];

        const dispose = claimReadContext((readApprovals, isSuccesful) => {
            approvals.push(...readApprovals);
            success = isSuccesful && success;
        });

        try {
            const maybeError = validator(undefined);

            if (!success) {
                return { approved: false, error: maybeError };
            }

            const approved = approvals.reduce(
                (acc, approval) => acc && approval
            );

            return { approved, error: maybeError };
        } finally {
            dispose();
        }
    });

    const store: ErrorBox = {
        get approved() {
            return lastCall.get().approved;
        },
        [getError]() {
            return lastCall.get().error;
        },
        [setApproved]() {
            // noop
        },
    };

    return makeAutoObservable(store);
};
