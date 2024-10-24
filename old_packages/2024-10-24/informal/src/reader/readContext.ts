export type ReadContext = {
    onRead: (approvals: boolean[], isSuccessful: boolean) => void;
};

export const readContext: ReadContext = {
    onRead: (_, isSuccessful) => {
        if (!isSuccessful) {
            // TODO: add link to docs
            throw new Error(
                '@informal/readContext use fallback when you use a reader outside of an errorBox'
            );
        }
    },
};

export const claimReadContext = (onRead: ReadContext['onRead']) => {
    const oldCtx = { ...readContext };

    const ctx: ReadContext = {
        onRead: onRead,
    };

    Object.assign(readContext, ctx);

    const dispose = () => {
        Object.assign(readContext, oldCtx);
    };

    return dispose;
};
