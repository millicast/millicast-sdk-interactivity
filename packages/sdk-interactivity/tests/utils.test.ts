import * as utils from '../src/utils';

describe('utils', () => {
    test('utils should match the snapshot', () => {
        expect(utils).toMatchSnapshot();
    });

    test('utils - sleep should take a nap', async () => {
        const seconds = 1.234;

        const start = performance.now();
        await utils.sleep(seconds);
        const stop = performance.now();

        expect(stop - start).toBeGreaterThanOrEqual(seconds * 1000 * 0.99);
    });

    test('utils - isNotDefined', async () => {
        expect(utils.isNotDefined('')).toBe(true);
        expect(utils.isNotDefined(null)).toBe(true);
        expect(utils.isNotDefined(undefined)).toBe(true);
        expect(utils.isNotDefined('ok')).toBe(false);
    });

    test('utils - firstOrUndefined', async () => {
        expect(utils.firstOrUndefined(null as unknown as any[])).toBeUndefined();
        expect(utils.firstOrUndefined(undefined as unknown as any[])).toBeUndefined();
        expect(utils.firstOrUndefined([])).toBeUndefined();

        expect(utils.firstOrUndefined(['a'])).toBe('a');
        expect(utils.firstOrUndefined(['a', 'b'])).toBe('a');
    });
});
