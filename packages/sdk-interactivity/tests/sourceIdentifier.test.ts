import { SourceIdentifier } from '../src/sourceIdentifier';
import { SourceType } from '../src/types/sourceType';

describe('SourceIdentifier', () => {
    test('SourceIdentifier should match the snapshot', () => {
        expect(SourceIdentifier).toMatchSnapshot();
    });

    test('SourceIdentifier - to source id', async () => {
        const sourceIdentifier = new SourceIdentifier('fabien', SourceType.Camera, 'Its me');

        expect(sourceIdentifier.publisherName).toBe('fabien');
        expect(sourceIdentifier.sourceType).toBe(SourceType.Camera);
        expect(sourceIdentifier.sourceName).toBe('Its me');
        expect(sourceIdentifier.sourceId).toBe('eyJwbiI6ImZhYmllbiIsInN0IjoiY2FtZXJhIiwic24iOiJJdHMgbWUifQ==');
    });

    test('SourceIdentifier - from source id', async () => {
        const sourceIdentifier = SourceIdentifier.fromSourceId('eyJwbiI6ImZhYmllbiIsInN0IjoiY2FtZXJhIiwic24iOiJJdHMgbWUifQ==');

        expect(sourceIdentifier.publisherName).toBe('fabien');
        expect(sourceIdentifier.sourceType).toBe(SourceType.Camera);
        expect(sourceIdentifier.sourceName).toBe('Its me');
        expect(sourceIdentifier.sourceId).toBe('eyJwbiI6ImZhYmllbiIsInN0IjoiY2FtZXJhIiwic24iOiJJdHMgbWUifQ==');
    });

    test('SourceIdentifier - from source id - invalid', async () => {
        const sourceIdentifier = SourceIdentifier.fromSourceId('main source');

        expect(sourceIdentifier.publisherName).toBe('main source');
        expect(sourceIdentifier.sourceType).toBe(SourceType.Custom);
        expect(sourceIdentifier.sourceName).toBe('main source');
        expect(sourceIdentifier.sourceId).toBe('main source');
    });

    test('SourceIdentifier - from source id - missing source type', async () => {
        const sourceIdentifier = SourceIdentifier.fromSourceId('eyJwbiI6Im1haW4gc291cmNlIiwic24iOiJtYWluIHNvdXJjZSJ9');

        expect(sourceIdentifier.publisherName).toBe('main source');
        expect(sourceIdentifier.sourceType).toBe(SourceType.Custom);
        expect(sourceIdentifier.sourceName).toBe('main source');
        expect(sourceIdentifier.sourceId).toBe('eyJwbiI6Im1haW4gc291cmNlIiwic24iOiJtYWluIHNvdXJjZSJ9');
    });
});
