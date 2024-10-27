export type SuggestOption<Value> = {
    value: Value;
    content: string;
};

export type SuggestComparator<Value> = (
    query: string
) => (a: SuggestOption<Value>, b: SuggestOption<Value>) => number;

export type SuggestProvider<Value> = {
    getSuggestions: (
        query: string
    ) => SuggestOption<Value>[] | Promise<SuggestOption<Value>[]>;
    getDisplayValue: (value: Value | undefined) => string | Promise<string>;
};

export const localProvider = <Value>(
    options: SuggestOption<Value>[],
    settings: {
        comparator?: SuggestComparator<Value>;
        minQueryLength?: number;
        searchType?: 'startsWith' | 'includes';
        getDisplayValue?: (
            value: Value | undefined
        ) => string | Promise<string>;
    } = {}
): SuggestProvider<Value | undefined> => {
    const finalSettings = {
        minQueryLength: 0,
        searchType: 'includes',
        ...settings,
    };

    const lowerCaseOptions = options.map((option) =>
        option.content.toLowerCase()
    );

    return {
        getSuggestions(q: string) {
            const queryLowerCase = q.toLowerCase();

            if (!queryLowerCase) {
                return options;
            }

            if (queryLowerCase.length < finalSettings.minQueryLength) {
                return [];
            }

            const response = options.filter((_, index) =>
                settings.searchType === 'includes'
                    ? lowerCaseOptions[index].includes(queryLowerCase)
                    : lowerCaseOptions[index].startsWith(queryLowerCase)
            );

            if (settings.comparator) {
                response.sort(settings.comparator(queryLowerCase));
            }

            return response;
        },

        getDisplayValue: (value: Value | undefined) => {
            if (settings.getDisplayValue) {
                return settings.getDisplayValue(value);
            }

            if (typeof value === 'undefined') {
                return '';
            }

            return (
                options.find((option) => option.value === value)?.content || ''
            );
        },
    };
};

export const asyncProvider = <Value>(
    getSuggestions: (query: string) => Promise<SuggestOption<Value>[]>,
    getDisplayValue: (value: Value | undefined) => Promise<string>
): SuggestProvider<Value | undefined> => {
    const valueToString = new Map();

    return {
        getSuggestions: async (query: string) => {
            const options = await getSuggestions(query);

            for (const option of options) {
                valueToString.set(
                    option.value,
                    valueToString.get(option.value) ?? option.content
                );
            }

            return options;
        },
        getDisplayValue: async (value: Value | undefined) => {
            valueToString.set(
                value,
                valueToString.get(value) ?? getDisplayValue(value)
            );

            return valueToString.get(value);
        },
    };
};
