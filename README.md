# Text-to-Speech-WebSocket-Integration


Fullstack Challenge for a Text-to-Speech WebSocket Integration
By FlyShirley for Hayley Walters on Nov 7 2024
Due in 5 days at midnight (23:59) local: Nov 12 2024

## Background

You'll be building the text to speech system for a Node.js/TypeScript application that integrates with a text-to-speech WebSocket API. The application will handle real-time audio streaming and transcript management, with a focus on clean architecture and test-driven development.

## Core Requirements

### TTS API

```ts
speak(text: string, endOfUtterance?: boolean): Promise<void>;
stopSpeaking(): Promise<void>;

onTranscriptUpdate?: (transcript: string, speechStartMs: number) => Promise<void>;
```

### WebSocket Integration

The text-to-speech API accepts WebSocket connections and expects messages in the following format:

- Text messages must contain complete words ending with a space
- A `flush` message signals the end of transmission
- Messages should include a `text` property for speech content

The API responds with messages containing:

- `audio` property: Contains audio samples
- `alignment` property: Timing data for each spoken character

Example API Response:

```typescript
{
  "audio": Float32Array,  // Audio samples in Base64 format
  "alignment": {
    "chars": [
      "S", "h", "i", "r", "l", "e", "y", ",", " ",
      "a", "n", " ", "a", "n", "c", "i", "e", "n", "t", " ",
      "v", "a", "m", "p", "i", "r", "e", ",", " ",
      "b", "o", "a", "r", "d", "e", "d"
    ],
    "charStartTimesMs": [
      0, 104, 174, 244, 325, 406, 464, 522, 557,
      580, 627, 685, 778, 848, 929, 987, 1033, 1068, 1103, 1161,
      1219, 1277, 1393, 1474, 1567, 1741, 1811, 1962, 2009,
      2252, 2345, 2438, 2473, 2519, 2577, 2647
    ],
    "charDurationsMs": [
      104, 70, 70, 81, 81, 58, 58, 35, 23,
      47, 58, 93, 70, 81, 58, 46, 35, 35, 58, 58,
      58, 116, 81, 93, 174, 70, 151, 47, 243,
      93, 93, 35, 46, 58, 70, 93
    ]
  }
}
```

In this example:

- `chars`: Array of individual characters being spoken
- `charStartTimesMs`: Start time of each character in milliseconds
- `charDurationsMs`: Duration of each character in milliseconds

Your implementation should process this timing data to:

1. Build an accurate transcript
2. Track current playback position
3. Handle interruptions cleanly

### Key Features

1. **Transcript Management System**

   - Build a system to maintain and display the transcript of spoken content
   - Trasncript should increase in length one word at time
   - The last word should match the timing from the alignment data ([reference FlyShirley](https://youtu.be/eE68AkCOkWk?si=pu2PfAovO0d28NmA&t=117))

2. **Playback Control System**
   - Implement functionality to interrupt ongoing speech
   - Handle cleanup and state management for interrupted playback
   - Ensure graceful transition between playback states

### Technical Requirements

- Use TypeScript and Node.js
- Fullfil the TTS API requirements
- Implement using test-driven development (TDD)
- Create a mock WebSocket server for testing (which should return dummy alignment data for provided text)
- Include a test script or test page demonstrating:
  - User typing speech text to be spoken
  - Single keypress or mouse click to send text to the TTS API (rapid text inputs should queue the text to be spoken until ended) (e.g. "Hello, my name is Shirley")
  - Single keypress or mouse click to indicate the end of the current utterance (e.g. "(return key)")
  - A single keypress or mouse click to stop the current playback
  - Visual display of transcript output
  - Single keypress or mouse click to cancel current playback
  - Mock alignment data generation that follows the format shown above

## Future Integration

The solution should be designed with the intention of eventually connecting to the ElevenLabs WebSocket API (https://elevenlabs.io/docs/api-reference/how-to-use-websocket).

## Evaluation Criteria

- Implementation of core requirements
- Code quality and organization
- Git commit history and organization
- Test coverage and quality (doesn't need to be 100%, but should cover all core functionality and likely edge cases)

## Time Expectation

- Intended completion time: Under 10 hours
- Please track your time and include it in your submission

## Submission Requirements

1. Source code in a Git repository
2. README with:
   - Quick Setup instructions
   - Quick Architecture Overview (if needed, feel free to include in the code)
   - Testing approach and coverage (does)
   - Time spent
   - Any assumptions or trade-offs made
3. Working test script demonstrating core functionality

## Getting Started

We recommend following these initial steps (this is not required, but a suggestion):

1. Set up a TypeScript/Node.js project with testing framework
2. Stub implement the TTS API
3. Implement the mock WebSocket server
4. Satify the core requirements
5. Build the test script/application/frontend
6. Add documentation

## Bonus Points (Optional)

- Implement actual WebSocket connection to 11Labs API
  - implement reconnection handling
- Actually hear audio through the browser
- Handle edge cases like:
  - Multiple rapid interruptions
  - Network latency simulation
  - Buffering strategies for smooth playback
- Make it fancy & nice looking by using React or NextJs, or styling using Tailwinds CSS
- Anything else you think would be valuable
