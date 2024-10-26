import { isValidationError, submit } from '@informal/pkg';

import { adjuster } from './adjuster';

describe('adjuster', () => {
    test('default type is percent', () => {
        const store = adjuster();
        store.percent.percent.value = 50;
        store.count.count.value = 100;

        const result = submit(store);
        if (isValidationError(result)) {
            return expect(result).toBe('this should not happen');
        }
        expect(result).toEqual({ type: 'Top%', percent: 50 });
    });

    test('disabled branch does not affect valiation', () => {
        const store = adjuster();
        store.percent.percent.value = 50;

        const result = submit(store);
        if (isValidationError(result)) {
            return expect(result).toBe('this should not happen');
        }

        expect(result.type).toBe('Top%');

        store.percent.percent.value = -1000;
        store.count.count.value = 100;
        store.currentKey = 'count';

        const result2 = submit(store);

        if (isValidationError(result2)) {
            return expect(result2).toBe('this should not happen');
        }

        expect(result2).toEqual({ type: 'TopN', count: 100 });
    });
});
