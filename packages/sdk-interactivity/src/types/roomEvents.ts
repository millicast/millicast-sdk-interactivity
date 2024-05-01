import { Publisher } from '../publisher';
import { Room } from '../room';
import { Source } from '../source';
import { SourceIdentifier } from '../sourceIdentifier';

/**
 * Events triggered by the {@link Room} object.
 */
export type RoomEvents = {
    /**
     * Event triggered when a new publisher starts publishing to the stream.
     *
     * @example
     * ```ts
     * import { Publisher, Room } from '@millicast/sdk-interactivity';
     *
     * const room = new Room({
     *   streamName,
     *   streamAccountId,
     *   publisherName,
     * });
     *
     * room.on('publisherJoined', (publisher: Publisher) => {
     *   console.log(`The publisher ${publisher.name} has joined the stream.`);
     *   // TODO: Add the video element to the UI
     * });
     * ```
     *
     * @param publisher The {@link Publisher} object that represents the publisher starting publishing to the stream.
     */
    publisherJoined(publisher: Publisher): void;

    /**
     * Event triggered when a publisher stops publishing to the stream.
     *
     * @example
     * ```ts
     * import { Publisher, Room } from '@millicast/sdk-interactivity';
     *
     * const room = new Room({
     *   streamName,
     *   streamAccountId,
     *   publisherName,
     * });
     *
     * room.on('publisherLeft', (publisher: Publisher) => {
     *   console.log(`The publisher ${publisher.name} has left.`);
     *   // TODO: Remove the video element from the UI
     * });
     * ```
     *
     * @param publisher {@link Publisher} object that represents the publisher that stopped publishing to the stream.
     */
    publisherLeft(publisher: Publisher): void;

    /**
     * Event triggered when a new source is being published to the stream.
     *
     * @example
     * ```ts
     * import { Publisher, Room, Source } from '@millicast/sdk-interactivity';
     *
     * const room = new Room({
     *   streamName,
     *   streamAccountId,
     *   publisherName,
     * });
     *
     * room.on('sourceAdded', async (publisher: Publisher, source: Source) => {
     *   console.log(`The publisher ${publisher.name} has started publishing the source ${source.sourceId.sourceName} (${source.sourceId.sourceType}).`);
     *   // Request to receive the source
     *   await source.receive();
     *   // TODO: Add the media stream to the UI
     *   const stream = source.mediaStream;
     * });
     * ```
     *
     * @param publisher The {@link Publisher} object that represents the publisher starting publishing a new source to the stream.
     * @param source The {@link Source} object that was added to the stream.
     */
    sourceAdded(publisher: Publisher, source: Source): void;

    /**
     * Event triggered when a source stopped being published.
     *
     * @example
     * ```ts
     * import { Publisher, Room, SourceIdentifier } from '@millicast/sdk-interactivity';
     *
     * const room = new Room({
     *   streamName,
     *   streamAccountId,
     *   publisherName,
     * });
     *
     * room.on('sourceRemoved', (publisher: Publisher, sourceId: SourceIdentifier) => {
     *   // TODO: Remove the video from the UI
     * });
     * ```
     *
     * @param publisher The {@link Publisher} object that represents the publisher who stopped publishing the source.
     * @param sourceId The {@link SourceIdentifier} object that the represent the identifier of the source that stopped being published.
     */
    sourceRemoved(publisher: Publisher, sourceId: SourceIdentifier): void;

    /**
     * Event triggered from time to time to indicate the number of viewers connected to the stream.
     *
     * @example
     * ```ts
     * import { Room } from '@millicast/sdk-interactivity';
     *
     * const room = new Room({
     *   streamName,
     *   streamAccountId,
     *   publisherName,
     * });
     *
     * room.on('viewercount', (count: number) => {
     *   console.log(count, 'viewer(s) connected.');
     * });
     * ```
     *
     * @param count Number of viewers connected to the stream.
     */
    viewercount(count: number): void;
};
