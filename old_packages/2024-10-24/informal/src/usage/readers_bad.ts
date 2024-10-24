import { extractValue, ExtractValue, isInvalidForm } from '../submit';

export type ReadContext = {
    reportUnapprovedRead: (reason: string, report: unknown) => void;
};

export const readContext: ReadContext = {
    reportUnapprovedRead: () => 0,
};

export const claimReadContext = (handleError: (type: string) => void) => {
    const oldCtx = { ...readContext };

    const ctx = {
        reportError: handleError,
    };

    const dispose = () => {
        Object.assign(readContext, oldCtx);
    };

    Object.assign(readContext, ctx);

    return { ctx, dispose };
};

export const applyReadContext = (
    handleError: (type: string) => void
): ReadContext => {
    return {
        reportUnapprovedRead: handleError,
    };
};

// export const value = <T>(input: Input<T>): T => stub;

export const valid = <T>(store: T): ExtractValue<T> => {
    const value = extractValue(store, () => 0);

    if (isInvalidForm(value)) {
        readContext.reportUnapprovedRead('Invalid values', value.report);
    }

    return value;
};
