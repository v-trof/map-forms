import { localProvider } from './suggestProvider';

describe('localProvider', () => {
    const makeOption = <T>(value: T) => ({ value, content: `${value}` });
    const options = <T>(...values: T[]) => values.map(makeOption);

    it('returns 2 methods', () => {
        const provider = localProvider([]);

        expect(Object.entries(provider).length).toBe(2);
    });

    it('using minQueryLength parameter', () => {
        const provider = localProvider(options(11, 22, 333, 334, 335), {
            minQueryLength: 2,
        });

        expect(provider.getSuggestions('')).toStrictEqual(
            options(11, 22, 333, 334, 335)
        );
        expect(provider.getSuggestions('1')).toStrictEqual([]);
        expect(provider.getSuggestions('11')).toStrictEqual(options(11));
        expect(provider.getSuggestions('22')).toStrictEqual(options(22));
        expect(provider.getSuggestions('33')).toStrictEqual(
            options(333, 334, 335)
        );
        expect(provider.getSuggestions('4')).toStrictEqual([]);
    });

    it('sorts with comparator', () => {
        const comparatorFn = jest.fn();
        const provider = localProvider(options(15, 14, 12, 11, 16), {
            minQueryLength: 1,
            comparator: () => (a, b) => {
                comparatorFn();

                return a.value - b.value;
            },
        });

        expect(provider.getSuggestions('1')).toStrictEqual(
            options(11, 12, 14, 15, 16)
        );
        expect(comparatorFn).toBeCalled();
    });

    it('finds value by string', () => {
        const provider = localProvider(options(1, 2, 3, 4, 5));

        for (let i = 1; i <= 5; i++) {
            expect(provider.getDisplayValue(i)).toBe(`${i}`);
        }

        expect(provider.getDisplayValue(6)).toBe('');
        expect(provider.getDisplayValue(812)).toBe('');
        expect(provider.getDisplayValue(undefined)).toBe('');
    });
});
