export type FakeResponse<Result> =
    | { ok: true; value: Result }
    | { ok: false; errors: { code: string; params?: object }[] };

export const post = async <Data, Result = never>(
    url: string,
    data: Data,
    res: FakeResponse<Result>
): Promise<FakeResponse<Result>> => {
    await new Promise((r) => setTimeout(r, 1000));

    return Promise.resolve(res);
};
