import { TTS } from '../TTS'; // Assuming TTS.ts is in the same directory
import { setTimeout } from 'timers/promises';


// Mocking the global fetch function
global.fetch = jest.fn();

// Mocking HTMLAudioElement
const mockAudioElement = {
  play: jest.fn(),
  pause: jest.fn(),
  load: jest.fn(),
  currentTime: 0,
  src: '',
  onended: jest.fn(),
} as unknown as HTMLAudioElement;

describe('TTS class', () => {
  let ttsInstance: TTS;

  beforeEach(() => {
    ttsInstance = TTS.getInstance();
    ttsInstance.setAudioElement(mockAudioElement);

    ttsInstance.onTranscriptEnd = async () => {
        console.log("test TTS ended");
    }

    // Reset the mock fetch function before each test
    (fetch as jest.Mock).mockReset();
  });

  afterEach(() => {
    ttsInstance.destroy(); // destroys all ongoing processes.
  })

  it('should not fetch alignment data if already speaking', async () => {
    const text = "Hello world";

    // Mock the fetch call to return a successful response with fake data
    (fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({
        alignment: {
          characters: ['H', 'e', 'l', 'l', 'o'],
          character_start_times_seconds: [0, 1, 2, 3, 4],
          character_end_times_seconds: [1, 2, 3, 4, 5],
        },
        audio_base64: 'fakeAudioData',
      }),
    });

    // Set the instance to be speaking already
    ttsInstance['isSpeaking'] = true;
    ttsInstance['isPaused'] = false;
    ttsInstance['skipping'] = false;

    // Call speak when already speaking
    await ttsInstance.speak(text);

    // Check that the fetch API was not called (since we are already speaking)
    expect(fetch).not.toHaveBeenCalled();
  });

  it('should start speaking and display characters when speak is called', async () => {
    const text = "Hello world";

    // Mock the fetch response with alignment data
    (fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({
        alignment: {
          characters: ['H', 'e', 'l', 'l', 'o', ' ', 'w', 'o', 'r', 'l', 'd'],
          character_start_times_seconds: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
          character_end_times_seconds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
        },
        audio_base64: 'fakeAudioData',
      }),
    });

    // Call speak method
    await ttsInstance.speak(text);
    expect(ttsInstance['isSpeaking']).toBe(true);

    // Verify that fetch was called with the correct URL and payload
    expect(fetch).toHaveBeenCalledWith('/api/tts-alignment', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ text }),
    }));

    // Check that audio element is loaded and played
    expect(mockAudioElement.load).toHaveBeenCalled();
    expect(mockAudioElement.play).toHaveBeenCalled();

    // Check if the displayNextCharacter method was called (this is a side effect)
    expect(ttsInstance['displayedTranscript']).toBe('H'); // Initially 'H' should be displayed
  });

  it('should handle a failed fetch gracefully', async () => {
    const text = "Hello world";
  
    // Mock fetch to throw an error
    (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));
  
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  
    // Call speak and wait for it to finish
    await ttsInstance.speak(text);
  
    // Check that an error message is logged
    // expect(consoleErrorSpy).toHaveBeenCalledWith(expect.objectContaining({
    //   message: 'Error fetching alignment data: Network error'
    // }));
  
    // Check that the speaking state is false after the error
    expect(ttsInstance.getIsSpeaking()).toBe(false);
  
    // Clean up the spy
    consoleErrorSpy.mockRestore();
  });
  

  it('should queue transcripts if already speaking', async () => {
    const firstText = "First transcript";
    const secondText = "Second transcript";

    // Mock the fetch response
    (fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({
        alignment: {
          characters: ['F', 'i', 'r', 's', 't'],
          character_start_times_seconds: [0, 1, 2, 3, 4],
          character_end_times_seconds: [1, 2, 3, 4, 5],
        },
        audio_base64: 'fakeAudioData',
      }),
    });

    // Call speak with the first text
    await ttsInstance.speak(firstText);
    
    // Call speak again with the second text (should be queued)
    await ttsInstance.speak(secondText);

    // Check that the second transcript is in the queue
    expect(ttsInstance.getQueueSize()).toBe(1);
    expect(ttsInstance['transcriptQueue'][0]).toBe(secondText);
  });

  it('should handle skipping the transcript', async () => {
    const text = "Hello world";

    // Mock the fetch response
    (fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({
        alignment: {
          characters: ['H', 'e', 'l', 'l', 'o'],
          character_start_times_seconds: [0, 1, 2, 3, 4],
          character_end_times_seconds: [1, 2, 3, 4, 5],
        },
        audio_base64: 'fakeAudioData',
      }),
    });

    // Start speaking
    await ttsInstance.speak(text);

    // Skip the transcript
    ttsInstance.skipTranscript();

    // Verify that skipTranscript clears the timeout and stops the speech
    expect(mockAudioElement.pause).toHaveBeenCalled();
    expect(ttsInstance['isSpeaking']).toBe(false);
  });
  


  it('should pause the transcript playback when pauseSpeaking is called', async () => {
    const text = "Hello world";

    // Mock the fetch response with alignment data
    (fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({
        alignment: {
          characters: ['H', 'e', 'l', 'l', 'o', ' ', 'w', 'o', 'r', 'l', 'd'],
          character_start_times_seconds: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
          character_end_times_seconds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
        },
        audio_base64: 'fakeAudioData',
      }),
    });

    // Start speaking
    await ttsInstance.speak(text);
    
    // Pause speaking
    ttsInstance.pauseSpeaking();

    // Check that the audio element is paused
    expect(mockAudioElement.pause).toHaveBeenCalled();
    // Ensure that the speaking state is updated to false when paused
    expect(ttsInstance.getIsPaused()).toBe(true);
  });

  it('should resume the transcript playback when resumeSpeaking is called', async () => {
    const text = "Hello world";

    // Mock the fetch response with alignment data
    (fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({
        alignment: {
          characters: ['H', 'e', 'l', 'l', 'o', ' ', 'w', 'o', 'r', 'l', 'd'],
          character_start_times_seconds: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
          character_end_times_seconds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
        },
        audio_base64: 'fakeAudioData',
      }),
    });

    // Start speaking
    await ttsInstance.speak(text);
    
    // Pause speaking first
    ttsInstance.pauseSpeaking();

    // Ensure that it is paused
    expect(mockAudioElement.pause).toHaveBeenCalled();
    expect(ttsInstance.getIsPaused()).toBe(true);
    expect(ttsInstance.getIsSpeaking()).toBe(true);

    // Resume speaking
    ttsInstance.resumeSpeaking();

    // Check that the audio element is playing
    expect(mockAudioElement.play).toHaveBeenCalled();
    // Ensure that the speaking state is updated to true when resumed
    expect(ttsInstance.getIsPaused()).toBe(false);
    expect(ttsInstance.getIsSpeaking()).toBe(true);
  });

  it('should restart the transcript playback when restartTranscript is called', async () => {
    const text = "Hello world";

    // Mock the fetch response with alignment data
    (fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({
        alignment: {
          characters: ['H', 'e', 'l', 'l', 'o', ' ', 'w', 'o', 'r', 'l', 'd'],
          character_start_times_seconds: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
          character_end_times_seconds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
        },
        audio_base64: 'fakeAudioData',
      }),
    });

    // Start speaking
    await ttsInstance.speak(text);
    
    // Call restartTranscript while speaking
    ttsInstance.restartTranscript();

    await setTimeout(2);

    // Verify that the audio element is reset and played again
    expect(mockAudioElement.load).toHaveBeenCalled();
    expect(mockAudioElement.play).toHaveBeenCalled();
    expect(ttsInstance.getIsSpeaking()).toBe(true); // should always be true until endTranscript
    expect(ttsInstance['charPointer']).toBe(1); // starting at the first letter
    expect(ttsInstance['displayedTranscript']).toContain('H'); // beginning with the first letter
  });

  it('should clean up the instance properly on destroy', async () => {
    // Mock the fetch response with alignment data
    (fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({
        alignment: {
          characters: ['H', 'e', 'l', 'l', 'o'],
          character_start_times_seconds: [0, 1, 2, 3, 4],
          character_end_times_seconds: [1, 2, 3, 4, 5],
        },
        audio_base64: 'fakeAudioData',
      }),
    });

    // Start speaking
    await ttsInstance.speak("Hello world");

    // Call destroy to clean up
    ttsInstance.destroy();

    // Verify that internal states are reset
    expect(ttsInstance['isSpeaking']).toBe(false);
    expect(ttsInstance['isPaused']).toBe(false);
    expect(ttsInstance['transcriptQueue']).toEqual([]);
    expect(ttsInstance['alignmentData']).toEqual({ chars: [], charStartTimesMs: [], charDurationsMs: [] });
    expect(ttsInstance['audioElement']).toBeNull();
  });

  it('should queue and play next transcript after current one ends', async () => {
    const firstText = "First transcript";
    const secondText = "Second transcript";

    // Mock the fetch response with alignment data for both transcripts
    (fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({
        alignment: {
          characters: ['F', 'i', 'r', 's', 't'],
          character_start_times_seconds: [0, 1, 2, 3, 4],
          character_end_times_seconds: [1, 2, 3, 4, 5],
        },
        audio_base64: 'fakeAudioData',
      }),
    });

    // Call speak with the first text
    await ttsInstance.speak(firstText);

    // Mock the fetch response for the second transcript
    (fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({
        alignment: {
          characters: ['S', 'e', 'c', 'o', 'n', 'd'],
          character_start_times_seconds: [0, .1, .2, .3, .4, .5],
          character_end_times_seconds: [.1, .2, .3, .4, .5, .6],
        },
        audio_base64: 'fakeAudioData',
      }),
    });

    // Call speak with the second text (should be queued)
    await ttsInstance.speak(secondText);

    // Check that the second transcript is in the queue
    expect(ttsInstance.getQueueSize()).toBe(1);

    await setTimeout(100); // wait for 100 ms

    // Verify that the first transcript plays even though one is queued
    
    expect(ttsInstance.getTranscriptDisplay()).toContain('F');

    ttsInstance.skipTranscript();
    
    await setTimeout(100); // wait for 100 ms

    // Verify that the second transcript plays after the first one is skipped
    // After the first text finishes, the second should be played
    expect(ttsInstance.getTranscriptDisplay()).toBe('S'); // Initially, 'S' should be displayed from second text
  });
});
