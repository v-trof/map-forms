import { getValidValue } from './domain';

// having a separate overload for each type is necessary to prevent TypeScript from widening the type
export const constant: {
    <T extends string | number | boolean>(value: T): {
        readonly [getValidValue]: () => T;
    };
    <T>(value: T): { readonly [getValidValue]: () => T };
} = <T>(value: T) => {
    return {
        [getValidValue]: () => value,
    } as const;
};
