import { SourceType } from './sourceType';

/**
 * Information about the stream to connect to.
 *
 * @example
 * ```ts
 * import { StreamInformation, Room } from '@millicast/sdk-interactivity';
 *
 * const streamInfo: StreamInformation = {
 *   streamName: 'STREAM_NAME',
 *   streamAccountId: 'ACCOUNT_ID',
 * };
 *
 * const room = new Room(streamInfo);
 * ```
 */
export type StreamInformation = {
    /** Name of the stream. */
    streamName: string;
    /** Dolby Millicast account ID. */
    streamAccountId: string;
};

/**
 * Options to watch to a stream.
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
 * await room.watch({
 *   subscriberToken: 'SUBSCRIBER_TOKEN'
 * });
 * ```
 */
export type WatchOptions = {
    /**
     * Token to subscribe to secure streams.
     * If you are subscribing to an unsecure stream, you can omit this param.
     */
    subscriberToken?: string;
};

/**
 * Options to publish a stream with a specific {@link !MediaStreamConstraints MediaStreamConstraints} object.
 */
export type PublishWithConstraintsOptions = {
    /**
     * A {@link !MediaStreamConstraints MediaStreamConstraints} object specifying the types of media to request, along with any requirements for each type.
     *
     * The `constraints` parameter is an object with two members: video and audio, describing the media types requested. Either or both must be specified. If the browser cannot find all media tracks with the specified types that meet the constraints given, then the returned promise is rejected with `NotFoundError` {@link !DOMException DOMException}.
     *
     * For both `video` and `audio`, its value is either a boolean or an object. The default value is false.
     *
     * If `true` is specified for a media type, the resulting stream is required to have that type of track in it. If one cannot be included for any reason, the returned promise will reject.
     * If `false` is specified for a media type, the resulting stream must not have that type of track, or the returned promise will reject. Because both `video` and `audio` default to `false`, if the constraints object `contains` neither property or if it's not present at all, the returned promise will always reject.
     * If an object is specified for a media type, the object is read as a {@link MediaTrackConstraints} dictionary.
     */
    constraints: MediaStreamConstraints;
};

/**
 * Options to publish with a {@link !MediaStream MediaStream} object managed outside of this SDK.
 */
export type PublishWithStreamOptions = {
    /** The {@link !MediaStream MediaStream} object to publish to the stream. */
    mediaStream: MediaStream;
    /**
     * Release the {@link PublishWithStreamOptions.mediaStream mediaStream} when unpublishing the source.
     * @defaultValue Default value is `true`.
     */
    releaseOnLeave?: boolean;
};

/**
 * Options to start publishing to a stream.
 */
export type PublishOptions = (PublishWithConstraintsOptions | PublishWithStreamOptions) & {
    /** Token that allows publishing to the stream. */
    publishToken: string;
    /** Sets the type of source published. */
    sourceType: SourceType;
    /**
     * Sets the name of the source.
     * @defaultValue Default value is the source type.
     */
    sourceName?: string;
};

/**
 * Options to connect to a stream.
 */
export type ConnectOptions = WatchOptions &
    PublishOptions & {
        /** Name of the publisher. */
        publisherName: string;
    };
