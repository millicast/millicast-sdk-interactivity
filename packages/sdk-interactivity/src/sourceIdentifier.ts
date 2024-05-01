import { SourceType } from './types/sourceType';

/**
 * Represents a source identifier. This class allows to parse the identifier of the source into components like the publisher name, type of the source and name of the source.
 */
export class SourceIdentifier {
    #sourceId: string;

    /** Gets the source identifier. */
    get sourceId(): string {
        return this.#sourceId;
    }

    #publisherName: string;

    /** Gets the name of the publisher. */
    get publisherName(): string {
        return this.#publisherName;
    }

    #sourceType: SourceType;

    /** Gets the type of source published. */
    get sourceType(): SourceType {
        return this.#sourceType;
    }

    #sourceName: string;

    /** Gets the name of the source. */
    get sourceName(): string {
        return this.#sourceName;
    }

    /**
     * Create an instance of the {@link SourceIdentifier} class.
     *
     * @param publisherName Name of the source publisher.
     * @param sourceType Type of source.
     * @param sourceName Name of the source.
     */
    constructor(publisherName: string, sourceType: SourceType, sourceName: string) {
        this.#publisherName = publisherName;
        this.#sourceType = sourceType;
        this.#sourceName = sourceName;

        const obj = {
            pn: publisherName,
            st: sourceType,
            sn: sourceName,
        };
        const jsonStr = JSON.stringify(obj);
        this.#sourceId = btoa(jsonStr);
    }

    /**
     * Get a {@link SourceIdentifier} object extracted from the source ID received from the Dolby.io Real-time Streaming platform.
     *
     * @param sourceId Source Identifier received from the Dolby.io Real-time Streaming platform.
     *
     * @returns The {@link SourceIdentifier} object representing the source identifier.
     */
    public static fromSourceId = (sourceId: string): SourceIdentifier => {
        let publisherName: string;
        let sourceType: SourceType;
        let sourceName: string;

        try {
            const jsonStr = atob(sourceId);
            const { pn, st, sn } = JSON.parse(jsonStr);

            publisherName = pn;
            sourceType = st;
            sourceName = sn;
        } catch (error) {
            // Probably an external source not following the formatting
        }

        const result = new SourceIdentifier(publisherName ?? sourceId, sourceType ?? SourceType.Custom, sourceName ?? sourceId);
        result.#sourceId = sourceId;

        return result;
    };
}
