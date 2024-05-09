[![Build Package](https://github.com/millicast/millicast-sdk-interactivity/actions/workflows/build-package.yml/badge.svg)](https://github.com/millicast/millicast-sdk-interactivity/actions/workflows/build-package.yml)
[![Build Documentation](https://github.com/millicast/millicast-sdk-interactivity/actions/workflows/build-documentation.yml/badge.svg)](https://github.com/millicast/millicast-sdk-interactivity/actions/workflows/build-documentation.yml)
[![Publish Package](https://github.com/millicast/millicast-sdk-interactivity/actions/workflows/publish-package.yml/badge.svg)](https://github.com/millicast/millicast-sdk-interactivity/actions/workflows/publish-package.yml)
[![npm](https://img.shields.io/npm/v/@millicast/sdk-interactivity)](https://www.npmjs.com/package/@millicast/sdk-interactivity)

# Dolby.io - Millicast Interactivity SDK

This project is an SDK built on top of the [@millicast/sdk](https://github.com/millicast/millicast-sdk) library to provide an easier way to manage bi-directional communications on the [Dolby.io Real-time Streaming](https://dolby.io/) platform.

## Getting Started

To get started, install this SDK into your web application. The [@millicast/sdk](https://github.com/millicast/millicast-sdk) library will be installed as a dependency.

```bash
npm install @millicast/sdk-interactivity
```

To import this SDK via script, you will need to load the SDK as UMD as well as the Millicast SDK. An example is provided in the [./example](example) folder of this repository.

```html
<script src="https://cdn.jsdelivr.net/npm/@millicast/sdk/dist/millicast.umd.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@millicast/sdk-interactivity/dist/millicast-sdk-interactivity.min.js"></script>
```

Then you can use the SDK using the variable `MillicastInteractivity`.

### Events

The SDK can trigger the following events:

-   `publisherJoined` - Event triggered when a new publisher starts publishing to the stream.
-   `publisherLeft` - Event triggered when a publisher stops publishing to the stream.
-   `sourceAdded` - Event triggered when a new source is being published to the stream.
-   `sourceRemoved` - Event triggered when a source stopped being published.
-   `viewercount` - Event triggered from time to time to indicate the number of viewers connected to the stream.

```ts
import { Publisher, Room, Source } from '@millicast/sdk-interactivity';

const room = new Room({
    streamName,
    streamAccountId,
});

room.on('viewercount', (count: number) => console.log('Viewer count is', count));

room.on('sourceAdded', async (publisher: Publisher, source: Source) => {
    const { identifier } = source;
    console.log(`New ${identifier.sourceType} source: ${identifier.sourceName}`);
    console.log(`is available from ${publisher.name}.`);

    // Request to receive the source
    await source.receive();

    // Display the source on the UI
    const videoElement = document.getElementById('video');
    videoElement.srcObject = new MediaStream([source.videoTrack]);
    videoElement.play();
});
```

### Connect to a stream

To publish your camera into a stream and listen to the available sources, call the `connect` function. Once connected, the SDK will trigger a series of `publisherJoined` and `sourceAdded` events that you must subscribe to in order to get the audio / video streams coming from the platform, and display them on your web page.

```ts
import { Publisher, Room, Source } from '@millicast/sdk-interactivity';

const room = new Room({
    streamName,
    streamAccountId,
});

room.on('publisherJoined', (publisher: Publisher) => {
    console.log(`${publisher.name} joined.`);
});
room.on('sourceAdded', (publisher: Publisher, source: Source) => {
    const { identifier } = source;
    console.log(`New ${identifier.sourceType} source: ${identifier.sourceName}`);
    console.log(`is available from ${publisher.name}.`);
});

// Let the SDK handle the getUserMedia
const publishedSource = await room.connect({
    publishToken,
    publisherName,
    constraints: {
        // Set WebRTC Media Stream constraints
        audio: true,
        video: true,
    },
});

// If you want to provide your own media stream, use the following code
const customPublishedSource = await room.connect({
    publishToken,
    publisherName,
    mediaStream,
});

// Stop publishing sources
room.unpublish(publishedSource);
room.unpublish(customPublishedSource);
```

### Watch to a stream

To watch a stream, call the `watch` function. Once connected, the SDK will trigger a series of `publisherJoined` and `sourceAdded` events that you must subscribe to in order to get the audio / video streams coming from the platform, and display them on your web page.

```ts
import { Publisher, Room, Source } from '@millicast/sdk-interactivity';

const room = new Room({
    streamName,
    streamAccountId,
});

room.on('publisherJoined', (publisher: Publisher) => {
    console.log(`${publisher.name} joined.`);
});
room.on('sourceAdded', (publisher: Publisher, source: Source) => {
    const { identifier } = source;
    console.log(`New ${identifier.sourceType} source: ${identifier.sourceName}`);
    console.log(`is available from ${publisher.name}.`);
});

await room.watch();
```

### Publish a new source to a stream

To publish another source into a stream, call the `publish` function.

```ts
// Will publish another source
await room.publish({
    publishToken,
    constraints: {
        // Set WebRTC Media Stream constraints
        audio: true,
        video: true,
    },
});
```

To publish a screenshare into the stream, call the [`getDisplayMedia`](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getDisplayMedia) function to get the screenshare stream. and the `publish` function.

```ts
import { SourceType } from '@millicast/sdk-interactivity';

// Prompts the user to select and grant permission to capture the contents
// of a display or portion thereof (such as a window).
const mediaStream = await navigator.mediaDevices.getDisplayMedia({});

const source = await room.publish({
    mediaStream,
    releaseOnLeave: true,
    publishToken,
    sourceType: SourceType.Screenshare,
    sourceName: 'My Screenshare',
});

// Display the screenshare on the page
const videoElement = document.getElementById('screenshare');
videoElement.srcObject = new MediaStream([source.videoTrack]);
videoElement.play();
```

## How to

The unit tests are built on [Jest](https://jestjs.io/), to execute the tests, run the following command.

```bash
npm run test
```

Create distribution package:

```bash
npm run build
```

The documentation is built on [TypeDoc](https://typedoc.org), to generate the doc, run the following command. You will find the HTML files in the `docs` folder.

```bash
npm run docs
```

You can also print the logs in the console and select the log level by using the following code.

```ts
import { Logger } from '@millicast/sdk-interactivity';

Logger.useDefaults({
    defaultLevel: Logger.TRACE,
});
```

## Related Projects

-   [Dolby.io WebRTC Statistics](https://github.com/DolbyIO/web-webrtc-stats)
-   [Millicast SDK](https://github.com/millicast/millicast-sdk)
-   [js-logger](https://github.com/jonnyreeves/js-logger)
-   [TypeDoc](https://typedoc.org)
-   [Jest](https://jestjs.io/)
