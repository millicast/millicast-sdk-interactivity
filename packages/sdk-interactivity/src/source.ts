import { MediaTrackInfo, View } from '@millicast/sdk';
import { ILogger } from 'js-logger';
import { SourceIdentifier } from './sourceIdentifier';
import { firstOrUndefined } from './utils';

export class Source {
    #logger: ILogger;

    #viewer: View;
    #tracks: MediaTrackInfo[];
    #audioMediaId: string;
    #audioTrackId: string;
    #videoMediaId: string;
    #videoTrackId: string;

    /** @ignore */
    get videoMediaId(): string {
        return this.#videoMediaId;
    }

    #identifier: SourceIdentifier;

    /** Gets the source identifier. */
    get identifier(): SourceIdentifier {
        return this.#identifier;
    }

    #mediaStream: MediaStream;

    /** The actual audio / video stream. */
    get mediaStream(): MediaStream {
        return this.#mediaStream;
    }

    /** @hidden */
    constructor(logger: ILogger, viewer: View, sourceId: string, tracks: MediaTrackInfo[]) {
        this.#logger = logger;
        this.#viewer = viewer;
        this.#identifier = SourceIdentifier.fromSourceId(sourceId);
        this.#tracks = tracks;
        this.#mediaStream = new MediaStream();
    }

    /**
     * Request to start receiving the source.
     */
    public receive = async (): Promise<void> => {
        const trackAudio = this.#tracks?.find(({ media }) => media === 'audio');
        if (trackAudio) {
            const audioTransceiver = await this.#viewer.addRemoteTrack('audio', [this.#mediaStream]);
            this.#audioMediaId = audioTransceiver?.mid;
            this.#audioTrackId = trackAudio.trackId;
        }

        const trackVideo = this.#tracks?.find(({ media }) => media === 'video');
        if (trackVideo) {
            const videoTransceiver = await this.#viewer.addRemoteTrack('video', [this.#mediaStream]);
            this.#videoMediaId = videoTransceiver?.mid;
            this.#videoTrackId = trackVideo.trackId;
        }

        await this.project();
    };

    /**
     * Stop receiving the source.
     */
    public stop = async (): Promise<void> => {
        this.#logger.info('About to unproject Source ID:', this.#audioMediaId, this.#videoMediaId);
        await this.#viewer.unproject([this.#audioMediaId, this.#videoMediaId]);
    };

    /**
     * Project a source.
     */
    private project = async (): Promise<void> => {
        const mapping = [];
        if (this.#audioMediaId) {
            mapping.push({
                media: 'audio',
                trackId: this.#audioTrackId,
                mediaId: this.#audioMediaId,
            });
        }
        if (this.#videoMediaId) {
            mapping.push({
                media: 'video',
                trackId: this.#videoTrackId,
                mediaId: this.#videoMediaId,
            });
        }

        this.#logger.info('About to project Source ID:', this.#identifier.sourceId, '-> Track ID:', this.#audioTrackId, this.#videoTrackId);
        await this.#viewer.project(this.#identifier.sourceId, mapping);
    };

    /**
     * Threshold beyond which the publisher is considered to be speaking.
     * @hidden
     */
    readonly IS_SPEAKING_THRESHOLD = 0.002;

    /**
     * Gets if the remote source is considered to be speaking or not.
     *
     * @example
     * ```ts
     * import { Publisher, Room, Source } from '@millicast/sdk-interactivity';
     *
     * const room = new Room({
     *   streamName,
     *   streamAccountId,
     * });
     *
     * room.on('sourceAdded', async (publisher: Publisher, source: Source) => {
     *   // Request to receive the source
     *   await source.receive();
     *
     *   // Display the source on the UI
     *   const videoElement = document.getElementById('remote-video');
     *   videoElement.srcObject = new MediaStream([source.videoTrack]);
     *   videoElement.play();
     *
     *   setInterval(async () => {
     *     const isSpeaking = await source.isSpeaking();
     *     console.log('is speaking', isSpeaking);
     *   }, 1000);
     * });
     *
     * await room.watch();
     * ```
     *
     * @returns A {@link !Promise Promise} whose fulfillment handler receives a flag indicating if the publisher is considered to be speaking.
     */
    public isSpeaking = async (): Promise<boolean> => {
        if (!this.#audioMediaId) return false;

        try {
            const peerConnection: RTCPeerConnection = this.#viewer.getRTCPeerConnection();
            const stats: RTCStatsReport = await peerConnection.getStats();

            const stat = [...stats.values()].find((s) => s.kind === 'audio' && s.mid === this.#audioMediaId && s.audioLevel);
            if (stat) {
                return stat.audioLevel >= this.IS_SPEAKING_THRESHOLD;
            }
        } catch (error) {
            this.#logger.trace('isSpeaking - remote', this.#identifier.sourceId, error);
        }

        return false;
    };

    /**
     * Gets if the audio track is muted or not.
     * If no audio track is available, this returns `true`.
     */
    get isMuted(): boolean {
        const audioTrack = firstOrUndefined(this.#mediaStream.getAudioTracks());
        if (audioTrack) {
            return !audioTrack.enabled;
        }
        return true;
    }

    /**
     * Mutes the audio track.
     */
    public mute = (): void => {
        const audioTrack = firstOrUndefined(this.#mediaStream.getAudioTracks());
        if (audioTrack) {
            audioTrack.enabled = false;
        }
    };

    /**
     * Unmutes the audio track.
     */
    public unmute = (): void => {
        const audioTrack = firstOrUndefined(this.#mediaStream.getAudioTracks());
        if (audioTrack) {
            audioTrack.enabled = true;
        }
    };
}
