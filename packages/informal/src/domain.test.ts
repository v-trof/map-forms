import { error } from './domain';

test('Error has params key only when they are present', () => {
    // This is good for error readability
    expect(Object.hasOwn(error('required'), 'params')).toBe(false);
    expect(Object.hasOwn(error('minLength', { min: 4 }), 'params')).toBe(true);
});
