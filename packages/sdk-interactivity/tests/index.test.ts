// Avoid: ReferenceError: TextEncoder is not defined
import { TextEncoder } from 'util';
global.TextEncoder = TextEncoder;

import * as sdk from '../src/';

describe('SDK', () => {
    test('SDK should match the snapshot', () => {
        expect(sdk).toMatchSnapshot();
    });
});
