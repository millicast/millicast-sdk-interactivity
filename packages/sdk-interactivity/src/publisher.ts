import { Source } from './source';

export class Publisher {
    #name: string;

    /** Gets the name of the publisher. */
    get name(): string {
        return this.#name;
    }

    #sources: Map<string, Source>;

    /** Gets the list of available sources for this publisher. */
    get sources(): Source[] {
        return [...this.#sources.values()];
    }

    /** @hidden */
    constructor(name: string) {
        this.#name = name;
        this.#sources = new Map<string, Source>();
    }

    /** @hidden */
    addSource = (source: Source): void => {
        this.#sources.set(source.identifier.sourceId, source);
    };

    /** @hidden */
    removeSource = async (sourceId: string): Promise<void> => {
        if (this.#sources.has(sourceId)) {
            const source = this.#sources.get(sourceId);
            await source.stop();

            this.#sources.delete(sourceId);
        }
    };
}
