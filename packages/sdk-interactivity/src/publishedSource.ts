import { Director, Publish } from '@millicast/sdk';
import { ILogger } from 'js-logger';
import { firstOrUndefined, isNotDefined } from './utils';
import { PublishOptions, PublishWithConstraintsOptions, PublishWithStreamOptions } from './types/options';
import { SourceIdentifier } from './sourceIdentifier';

/**
 * Represents a published source.
 */
export class PublishedSource {
    #logger: ILogger;

    #streamName: string;
    #releaseOnLeave: boolean = true;

    #sourceId: SourceIdentifier;

    /**
     * Gets the {@link SourceIdentifier} object representing the source identifier.
     */
    get sourceId(): SourceIdentifier {
        return this.#sourceId;
    }

    #audioTrack: MediaStreamTrack;

    /**
     * Gets the audio track.
     */
    get audioTrack(): MediaStreamTrack {
        return this.#audioTrack;
    }

    #videoTrack: MediaStreamTrack;

    /**
     * Gets the video track.
     */
    get videoTrack(): MediaStreamTrack {
        return this.#videoTrack;
    }

    #publisher: Publish;

    /**
     * Gets the Millicast {@link !Publish Publish} object used to publish the source to the stream.
     */
    get publisher(): Publish {
        return this.#publisher;
    }

    /** @hidden */
    constructor(logger: ILogger, streamName: string, sourceId: SourceIdentifier) {
        this.#logger = logger;
        this.#streamName = streamName;
        this.#sourceId = sourceId;
    }

    /** @hidden */
    publish = async (options: PublishOptions): Promise<void> => {
        if (isNotDefined(options.publishToken)) throw 'The Publish Token is missing.';

        const tokenGeneratorPublisher = () =>
            Director.getPublisher({
                token: options.publishToken,
                streamName: this.#streamName,
            });

        this.#publisher = new Publish(this.#streamName, tokenGeneratorPublisher, true);

        const optionsWithMediaStream = options as PublishWithStreamOptions;
        if (optionsWithMediaStream.mediaStream) {
            this.#videoTrack = firstOrUndefined(optionsWithMediaStream.mediaStream.getVideoTracks());
            this.#audioTrack = firstOrUndefined(optionsWithMediaStream.mediaStream.getAudioTracks());
            this.#releaseOnLeave = optionsWithMediaStream.releaseOnLeave ?? true;
        } else {
            const optionsWithConstraints = options as PublishWithConstraintsOptions;
            const mediaStream = await navigator.mediaDevices.getUserMedia(optionsWithConstraints.constraints);
            this.#videoTrack = firstOrUndefined(mediaStream.getVideoTracks());
            this.#audioTrack = firstOrUndefined(mediaStream.getAudioTracks());
        }

        const tracks: MediaStreamTrack[] = [];
        if (this.#videoTrack) tracks.push(this.#videoTrack);
        if (this.#audioTrack) tracks.push(this.#audioTrack);

        await this.#publisher.connect({
            mediaStream: tracks,
            sourceId: this.#sourceId.sourceId,
        });
    };

    /** @hidden */
    unpublish = () => {
        if (this.#publisher) {
            this.#logger.info('Stop publishing into the stream');
            this.#publisher.stop();
            this.#publisher = undefined;
        }

        if (this.#releaseOnLeave) {
            this.#logger.info('Stop the audio & video tracks');
            this.#videoTrack?.stop();
            this.#audioTrack?.stop();
        }
    };

    /**
     * Threshold beyond which the publisher is considered to be speaking.
     * @hidden
     */
    readonly IS_SPEAKING_THRESHOLD = 0.002;

    /**
     * Gets if the publisher is considered to be speaking or not.
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
     * const localSource = await room.connect({
     *   publishToken,
     *   publisherName,
     *   constraints: {
     *     audio: true,
     *     video: true,
     *   },
     * });
     *
     * const videoElement = document.getElementById("local-video");
     * videoElement.srcObject = new MediaStream([localSource.videoTrack]);
     * videoElement.play();
     *
     * setInterval(async () => {
     *   const isSpeaking = await localSource.isSpeaking();
     *   console.log('is speaking', isSpeaking);
     * }, 1000);
     * ```
     *
     * @returns A {@link !Promise Promise} whose fulfillment handler receives a flag indicating if the publisher is considered to be speaking.
     */
    public isSpeaking = async (): Promise<boolean> => {
        if (!this.#audioTrack) return false;

        try {
            const peerConnection: RTCPeerConnection = this.#publisher.getRTCPeerConnection();
            const stats: RTCStatsReport = await peerConnection.getStats(this.#audioTrack);

            const stat = [...stats.values()].find((s) => s.kind === 'audio' && s.audioLevel);
            if (stat) {
                return stat.audioLevel >= this.IS_SPEAKING_THRESHOLD;
            }
        } catch (error) {
            this.#logger.trace('isSpeaking - local', this.#sourceId.sourceId, error);
        }

        return false;
    };

    /**
     * Gets if the audio track is muted or not.
     * If no audio track is available, this returns `true`.
     */
    get isMuted(): boolean {
        if (this.#audioTrack) {
            return !this.#audioTrack.enabled;
        }
        return true;
    }

    /**
     * Mutes the audio track.
     */
    public mute = (): void => {
        if (this.#audioTrack) {
            this.#audioTrack.enabled = false;
        }
    };

    /**
     * Unmutes the audio track.
     */
    public unmute = (): void => {
        if (this.#audioTrack) {
            this.#audioTrack.enabled = true;
        }
    };
}
