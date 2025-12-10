import * as sdk from '../src/';

describe('SDK', () => {
    test('SDK should match the snapshot', () => {
        expect(sdk).toMatchSnapshot();
    });
});
