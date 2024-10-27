import { z } from 'zod';

import { current, valid } from '../access';
import { options } from '../input';
import { submit } from '../submit';

import { suggest } from './suggest';
import { asyncProvider, localProvider } from './suggestProvider';

const numberProvider = localProvider(
    [1, 2, 3, 4, 5].map((num) => ({
        value: num,
        content: `str-${num}`,
    })),
    { searchType: 'includes' }
);
const asyncNumberProvider = asyncProvider(
    (query) =>
        Promise.resolve(
            new Array(100)
                .fill(0)
                .map((_, num) => num)
                .filter((num) =>
                    String(num).includes(query.replace('str-', ''))
                )
                .map((num) => ({ value: num, content: `str-${num}` }))
                .slice(0, 5)
        ),
    (num) => Promise.resolve(`str-${num}`)
);

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const slowNumberProvider = asyncProvider(
    async (query) => {
        const queryNumber = Number.isNaN(parseInt(query)) ? 0 : parseInt(query);

        await sleep(queryNumber);

        return Promise.resolve(
            new Array(100)
                .fill(0)
                .map((_, num) => num)
                .filter((num) =>
                    String(num).includes(query.replace('str-', ''))
                )
                .map((num) => ({ value: num, content: `str-${num}` }))
                .slice(0, 5)
        );
    },
    (num) => Promise.resolve(`str-${num}`)
);

test('suggest gets the initial query from the provider', async () => {
    const field = suggest(z.number(), numberProvider);
    field.onChange(3);
    await sleep(1);
    expect(field.suggest.query).toBe('str-3');
});

it('allows selecting form the menu ', async () => {
    const field = suggest(z.number(), numberProvider);
    await sleep(1);

    expect(field.suggest.lastOptions.length).toBe(5);
    const option = field.suggest.lastOptions.find((x) => x.content === 'str-3');
    expect(option).toBeDefined();
    field.onChange(option?.value);

    expect(field.value).toBe(3);
    await sleep(1);
    expect(field.suggest.query).toBe('str-3');
});

it('preloads options', async () => {
    const field = suggest(z.number(), asyncNumberProvider);
    field.onChange(8);
    await sleep(1);
    expect(field.suggest.query).toBe('str-8');

    const options = field.suggest.lastOptions;
    expect(options.length).toBe(5);

    expect(options[1].content).toBe('str-18');
});

it('updates menu items on query change', async () => {
    const field = suggest(z.number(), numberProvider);
    field.onChange(3);
    await sleep(1);
    expect(field.suggest.query).toBe('str-3');

    field.suggest.onQueryChange('4');
    await sleep(1);
    expect(field.suggest.lastOptions.length).toBe(1);

    field.onChange(field.suggest.lastOptions[0].value);
    await sleep(1);

    expect(field.value).toBe(4);
    expect(field.suggest.query).toBe('str-4');
});

it('does not update with incorrect options', async () => {
    const field = suggest(z.number(), slowNumberProvider);
    field.onChange(3);
    await sleep(1);
    expect(field.suggest.query).toBe('str-3');

    field.suggest.onQueryChange('4');
    await sleep(5);
    expect(field.suggest.lastOptions.length).toBe(5);
    expect(field.suggest.lastOptions[0].content).toBe('str-4');
    expect(field.suggest.lastOptions[1].content).toBe('str-14');
    expect(field.suggest.lastOptions[2].content).toBe('str-24');
    expect(field.suggest.lastOptions[3].content).toBe('str-34');
    expect(field.suggest.lastOptions[4].content).toBe('str-40');

    const pre5Options = field.suggest.lastOptions;

    field.suggest.onQueryChange('5');
    await sleep(1);
    field.suggest.onQueryChange('12');
    // 5 promise resolves -> no update expected
    expect(field.suggest.lastOptions).toBe(pre5Options);
    // 12 promise resolves
    await sleep(12);
    expect(field.suggest.lastOptions.length).toBe(1);
    expect(field.suggest.lastOptions[0].content).toBe('str-12');
    field.onChange(field.suggest.lastOptions[0].value);

    expect(field.value).toBe(12);
    await sleep(1);
    expect(field.suggest.query).toBe('str-12');
});

it('indicates if no items matched the query', async () => {
    const field = suggest(z.number(), asyncNumberProvider);
    field.onChange(8);
    await sleep(1);
    expect(field.suggest.query).toBe('str-8');

    const options = field.suggest.lastOptions;
    expect(options.length).toBe(5);

    field.suggest.onQueryChange('nope');
    await sleep(1);
    expect(field.suggest.lastOptions.length).toBe(0);
});

it('Has clear button that clears both query and value', async () => {
    const field = suggest(z.number(), numberProvider);
    field.onChange(3);
    await sleep(1);
    expect(field.suggest.query).toBe('str-3');

    field.onClear();
    await sleep(1);
    expect(field.suggest.query).toBe('');
    expect(field.value).toBe(undefined);
});

it('is compatible with options', async () => {
    const field = suggest(
        options('RS', 'NL', 'US', 'GB'),
        localProvider(
            (['RS', 'NL', 'US', 'GB'] as const).map((x) => ({
                value: x,
                content: x,
            }))
        )
    );
    field.onChange('RS');
    await sleep(1);
    expect(field.suggest.query).toBe('RS');
    field.onClear();
    expect(field.suggest.query).toBe('');
    expect(field.value).toBe(undefined);
    expect(current(field)).toBe(undefined);
    expect(() => valid(field)).toThrowError();

    field.onChange('NL');
    await sleep(1);

    const result = submit(field);
    expect(result).toBe('NL');
});
