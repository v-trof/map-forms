import { z, ZodString } from 'zod';

export type InformalString = Omit<ZodString, '_input'> & {
    readonly _input: string | undefined;
};
export const informalString = (): InformalString =>
    z.string() as InformalString;

export type InformalNumber = Omit<z.ZodNumber, '_input'> & {
    readonly _input: number | undefined;
};
export const informalNumber = (): InformalNumber =>
    z.number() as InformalNumber;

export type InformalEnum<T extends [string, ...string[]]> = Omit<
    z.ZodEnum<T>,
    '_input'
> & {
    readonly _input: undefined;
};

export declare type Writeable<T> = {
    -readonly [P in keyof T]: T[P];
};

export const informalEnum = <U extends string, T extends Readonly<[U, ...U[]]>>(
    values: T
): InformalEnum<Writeable<T>> =>
    z.enum(values) as unknown as InformalEnum<Writeable<T>>;

export const v = {
    string: informalString,
    number: informalNumber,
    enum: informalEnum,
};
