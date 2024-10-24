import { input } from './input';
import { current } from './reader/current';
import { valid } from './reader/valid';

test('Supports writing value into an input', () => {
    const login = input();

    login.value = 'v-trof';

    expect(login.value).toBe('v-trof');
    expect(current(login)).toBe('v-trof');
    expect(valid(login)).toBe('v-trof');
});
