import { Director, View, BroadcastEvent, MediaStreamSource, ViewerCount } from '@millicast/sdk';
import { EventEmitter } from 'events';
import Logger, { ILogger } from 'js-logger';
import { isNotDefined } from './utils';
import { ConnectOptions, PublishOptions, StreamInformation, WatchOptions } from './types/options';
import { RoomEvents } from './types/roomEvents';
import { Publisher } from './publisher';
import { PublishedSource } from './publishedSource';
import { Source } from './source';
import { SourceIdentifier } from './sourceIdentifier';

export interface Room {
    /**
     * Adds the `listener` function to the end of the listeners array for the
     * event named `eventName`. No checks are made to see if the `listener` has
     * already been added. Multiple calls passing the same combination of `eventName`and `listener` will result in the `listener` being added, and called, multiple
     * times.
     *
     * Returns a reference to the `EventEmitter`, so that calls can be chained.
     * @param eventName The name of the event.
     * @param listener The callback function.
     */
    on<N extends keyof RoomEvents>(eventName: N, listener: RoomEvents[N]): this;

    /** @hidden */
    emit<N extends keyof RoomEvents>(eventName: N, ...args: Parameters<RoomEvents[N]>): boolean;
}

/**
 * Representation of a stream. This class is the starting point for the SDK.
 * Create a instance of this class, connect to the Dolby Millicast platform and start receiving & publishing streams.
 *
 * @example
 * ```ts
 * import { Room } from '@millicast/sdk-interactivity';
 *
 * const room = new Room({
 *   streamName,
 *   streamAccountId,
 * });
 *
 * // Start publishing to the stream and listen to the available sources
 * await room.connect({
 *   publisherName,
 *   publishToken,
 *   constraints: {
 *     audio: true,
 *     video: true,
 *   },
 * });
 * ```
 */
export class Room extends EventEmitter implements Room {
    #logger: ILogger;
    #streamInfo: StreamInformation;
    #publisherName: string;

    #viewer: View;

    /**
     * Gets the Millicast {@link !View View} object once the SDK has been initialized.
     */
    get viewer(): View {
        return this.#viewer;
    }

    #publishers: Map<string, Publisher> = new Map<string, Publisher>();

    /**
     * Gets the list of {@link Publisher} objects that are currently publishing a stream.
     */
    get publishers(): Array<Publisher> {
        return [...this.#publishers.values()];
    }

    #publishedSources: Map<string, PublishedSource> = new Map<string, PublishedSource>();

    /**
     * Gets the list of {@link PublishedSource} objects that are currently published to the stream from the local device.
     */
    get publishedSources(): Array<PublishedSource> {
        return [...this.#publishedSources.values()];
    }

    /** Maximum number of sources that can be published from a single client. */
    readonly MAX_SOURCES: number = 5;

    /**
     * Create an instance of the {@link Room} class.
     *
     * @param streamInfo Information about the stream to connect to.
     */
    constructor(streamInfo: StreamInformation) {
        if (isNotDefined(streamInfo.streamName)) throw 'The Stream Name is missing.';
        if (isNotDefined(streamInfo.streamAccountId)) throw 'The Stream Account ID is missing.';

        super();

        this.#logger = Logger.get('Interactivity');
        this.#streamInfo = streamInfo;
    }

    private onBroadcastEvent = async (event: BroadcastEvent) => {
        this.#logger.debug('onBroadcastEvent', event);

        if (event.name === 'active') {
            const { sourceId, tracks } = event.data as MediaStreamSource;
            this.#logger.debug(`New source available - ${sourceId}`);
            if (this.#publishedSources.has(sourceId)) {
                this.#logger.debug('This is a local source so ignoring it.');
                return;
            }

            const source = new Source(this.#logger, this.#viewer, sourceId, tracks);

            let publisher: Publisher;
            if (this.#publishers.has(source.identifier.publisherName)) {
                publisher = this.#publishers.get(source.identifier.publisherName);
            } else {
                publisher = new Publisher(source.identifier.publisherName);
                this.#publishers.set(source.identifier.publisherName, publisher);
                this.emit('publisherJoined', publisher);
            }

            publisher.addSource(source);
            this.emit('sourceAdded', publisher, source);
        } else if (event.name === 'inactive') {
            const { sourceId } = event.data as MediaStreamSource;
            const sourceIdentifier = SourceIdentifier.fromSourceId(sourceId);

            this.#logger.debug(`The source has been stopped - ${sourceId}`);
            if (sourceIdentifier.publisherName === this.#publisherName) {
                this.#logger.debug('This is a local source so ignoring it.');
                return;
            }

            if (this.#publishers.has(sourceIdentifier.publisherName)) {
                const publisher = this.#publishers.get(sourceIdentifier.publisherName);
                publisher.removeSource(sourceId);

                this.emit('sourceRemoved', publisher, sourceIdentifier);

                if (publisher.sources.length <= 0) {
                    this.#publishers.delete(sourceIdentifier.publisherName);
                    this.emit('publisherLeft', publisher);
                }
            }
        } else if (event.name === 'viewercount') {
            const { viewercount } = event.data as ViewerCount;
            this.emit('viewercount', viewercount);
        }
    };

    /**
     * Connects to the stream. This function will publish a stream and listen to the sources.
     *
     * @param options Options to connect to the stream.
     *
     * @returns A {@link !Promise Promise} whose fulfillment handler receives a {@link PublishedSource} object when the source has successfully been published to the platform.
     */
    public connect = async (options: ConnectOptions): Promise<PublishedSource> => {
        this.#publisherName = options.publisherName;

        // Publish the source to the platform
        const publishedSource: PublishedSource = await this.publish(options);

        // Start watching the other sources
        await this.watch(options);

        return publishedSource;
    };

    /**
     * Start watching the stream.
     *
     * @param options Additional options to watch to the stream.
     */
    public watch = async (options?: WatchOptions): Promise<void> => {
        const tokenGeneratorViewer = () =>
            Director.getSubscriber({
                streamName: this.#streamInfo.streamName,
                streamAccountId: this.#streamInfo.streamAccountId,
                subscriberToken: options?.subscriberToken,
            });

        this.#viewer = new View(undefined, tokenGeneratorViewer, null, true);

        this.#viewer.on('broadcastEvent', this.onBroadcastEvent);

        await this.#viewer.connect({
            events: ['active', 'inactive', 'viewercount', 'layers'],
        });
    };

    /**
     * Publishes a video / audio feed to a stream.
     *
     * @param options Information about the stream to publish to.
     *
     * @returns A {@link !Promise Promise} whose fulfillment handler receives a {@link PublishedSource} object when the source has successfully been published to the platform.
     *
     * @throws {@link !Error Error} if you have not set the `publisherName` when connecting to the stream.
     * @throws {@link !Error Error} if you've reached the maximum number of sources that can be published from a single publisher.
     */
    public publish = async (options: PublishOptions): Promise<PublishedSource> => {
        if (isNotDefined(this.#publisherName)) {
            throw Error('The name of the publisher is missing. Reconnect to the stream.');
        }

        if (this.#publishedSources.size >= this.MAX_SOURCES) {
            throw Error(`Maximum number of ${this.MAX_SOURCES} sources reached!`);
        }

        const sourceId = new SourceIdentifier(this.#publisherName, options.sourceType, options.sourceName ?? options.sourceType);

        const publishedSource = new PublishedSource(this.#logger, this.#streamInfo.streamName, sourceId);
        await publishedSource.publish(options);

        this.#publishedSources.set(sourceId.sourceId, publishedSource);

        return publishedSource;
    };

    /**
     * Stops publishing the source to the stream.
     *
     * @param publishedSource Source that's currently being published.
     */
    public unpublish = (publishedSource: PublishedSource) => {
        publishedSource.unpublish();
        this.#publishedSources.delete(publishedSource.sourceId.sourceId);
    };

    /**
     * Leaves the stream. Will stop publishing into the stream and will stop listening to it.
     *
     * _Note_, the audio / video stream will be stopped to release allocated resources.
     *
     * @example
     * ```js
     * room.leave();
     * ```
     */
    public leave = (): void => {
        this.#publishedSources.forEach((publishedSource) => {
            publishedSource.unpublish();
        });

        if (this.#viewer) {
            this.#logger.info('Stop listening to the stream');
            this.#viewer.stop();
        }

        this.#publishers.clear();
    };
}
