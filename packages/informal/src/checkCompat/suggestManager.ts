import { observable, runInAction } from 'mobx';

import { SuggestProvider, SuggestOption } from './suggestProvider';

export type SuggestManager<Value> = {
    readonly query: string;
    onQueryChange: (newQuery: string) => Promise<void>;

    lastOptions: SuggestOption<NonNullable<Value>>[];

    setQueryFromValue: (newValue: Value) => void;
};

type SuggestSource<Value> = { value: Value | undefined; approved: boolean };

export const makeSuggestManager = <Value>(
    source: SuggestSource<Value>,
    provider: SuggestProvider<Value>
): SuggestManager<Value> => {
    const suggestManager = observable(
        {
            query: '',

            lastOptions: [] as SuggestOption<NonNullable<Value>>[],

            onQueryChange: async (newQuery: string) => {
                source.approved = false;
                suggestManager.query = newQuery;
                source.value = undefined;

                suggestManager.updateOptions(newQuery);
            },
            setQueryFromValue: async (newValue: Value | undefined) => {
                if (newValue === undefined) {
                    suggestManager.query = '';
                    suggestManager.updateOptions('');

                    return;
                }

                const initialQuery = suggestManager.query;
                const query = await provider.getDisplayValue(newValue);

                if (
                    source.value === newValue &&
                    suggestManager.query === initialQuery
                ) {
                    runInAction(() => {
                        suggestManager.query = query;
                    });

                    suggestManager.updateOptions(suggestManager.query);
                }
            },

            // internal methods
            updateOptions: async (newQuery: string) => {
                const items = await provider.getSuggestions(newQuery);

                // if query has changed, we shouldn't update with outdated items
                if (newQuery === suggestManager.query) {
                    runInAction(() => {
                        suggestManager.lastOptions = items as SuggestOption<
                            NonNullable<Value>
                        >[];
                    });
                }
            },
        },
        undefined,
        { deep: false }
    );

    suggestManager.setQueryFromValue(source.value);

    return suggestManager;
};
