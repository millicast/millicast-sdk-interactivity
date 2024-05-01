/**
 * The {@link SourceType} enumeration allows to identify the type of source.
 */
export enum SourceType {
    /** The source comes from a camera. */
    Camera = 'camera',

    /** The source is a screenshare capture. */
    Screenshare = 'screenshare',

    /** The source is a custom source. It can be coming from a hardware encoder, a capture from a DOM element or anything else. */
    Custom = 'custom',
}
