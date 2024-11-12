var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export class TTS {
    // Private constructor to prevent instantiation
    constructor() {
        // Internal state
        this.isSpeaking = false;
        this.audioElement = null;
        this.displayedTranscript = "";
        this.isPaused = false;
        this.charPointer = 0; // Tracks where we are in the alignment data
        this.transcriptQueue = [];
        this.skipping = false;
        this.controller = null;
        this.alignmentData = { chars: [], charStartTimesMs: [], charDurationsMs: [] }; // Holds the fetched alignment data
        this.currentTimeout = null; // Stores the timeout reference for pausing/resuming
    }
    // Get the singleton instance
    static getInstance() {
        if (!TTS.instance) {
            TTS.instance = new TTS();
        }
        return TTS.instance;
    }
    // public getter methods
    getIsSpeaking() {
        return this.isSpeaking;
    }
    setAudioElement(audioElement) {
        this.audioElement = audioElement;
    }
    getQueueSize() {
        return this.transcriptQueue.length;
    }
    getTranscriptDisplay() {
        return this.displayedTranscript;
    }
    /**
     * Sets this.alignmentData.charDurationsMs to the duration that each character should appear on the screen in ms.
     *
     * @param character_start_times_seconds The timestamp start of every character as it is spoken in the audio file, (s).
     * @param character_end_times_seconds The timestamp end of every character as it is spoken in the audio file, (s).
     * @returns void
     */
    setCharacterDurations(character_start_times_seconds, character_end_times_seconds) {
        // Ensure that the start and end times arrays have the same length
        if (character_start_times_seconds.length !== character_end_times_seconds.length) {
            throw new Error("Start and end times arrays must have the same length");
        }
        // Calculate the duration for each character (in seconds)
        const durationsInMs = character_start_times_seconds.map((startTime, index) => {
            const endTime = character_end_times_seconds[index];
            return (endTime - startTime) * 1000; // Duration in seconds
        });
        this.alignmentData.charDurationsMs = durationsInMs;
    }
    /**
     * Sets this.alignmentData.charStartTimesMs to character_start_times_seconds converted to ms
     *
     * @param character_start_times_seconds The timestamp start of every character as it is spoken in the audio file, (s).
     * @returns void
     */
    setCharStartTimesMs(character_start_times_seconds) {
        const startTimesInMs = character_start_times_seconds.map((startTime) => {
            return startTime * 1000;
        });
        this.alignmentData.charStartTimesMs = startTimesInMs;
    }
    /**
     * Begins updating the transcript, adding characters to the display. Audio will be played if the audioElement field is non-null.
     *
     * @param textInput The transcript that will be displayed
     */
    speak(textInput) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isSpeaking) {
                console.log("Already speaking, pushing transcript to queue");
                this.transcriptQueue.push(textInput);
                return;
            }
            else {
                this.isSpeaking = true;
            }
            try {
                // Create new AbortController for fetch cancellation (in case skip occurs while currently fetching alignment data)
                this.controller = new AbortController();
                const signal = this.controller.signal;
                // Fetch alignment data from the API
                const response = yield fetch('/api/tts-alignment', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ text: textInput }),
                    signal: signal
                });
                const data = yield response.json();
                if (data && data.alignment) {
                    this.alignmentData.chars = data.alignment.characters;
                    this.setCharacterDurations(data.alignment.character_start_times_seconds, data.alignment.character_end_times_seconds);
                    this.setCharStartTimesMs(data.alignment.character_start_times_seconds);
                    if (data.audio_base64 && this.audioElement) {
                        this.audioElement.src = `data:audio/mp3;base64,${data.audio_base64}`;
                        this.audioElement.load();
                        this.audioElement.play();
                    }
                    this.charPointer = 0;
                    this.displayedTranscript = "";
                    this.displayNextCharacter();
                }
                else {
                    console.error('Failed to fetch alignment data');
                }
            }
            catch (error) {
                if (error instanceof Error) {
                    if (error.name == 'AbortError') {
                        console.log("Fetch aborted");
                    }
                }
                else {
                    console.error('Error fetching alignment data:', error);
                }
            }
        });
    }
    /**
     *
     * Helper method for "speak". Continuously displays characters from the text
     * passed to "speak" until there are none left.
     * Begins updating the transcript, adding characters to the display.
     * Audio will be played and characters will by synchronized to the audio if the audioElement
     * field is non-null. Otherwise, characters will still display with proper ms gaps between them.
     */
    displayNextCharacter() {
        // console.log(`displaychar on ${this.alignmentData.chars}. charptr:${this.charPointer}`);
        // Stop if paused, not speaking, or the alignment data is empty (happens when )
        if (this.isPaused || !this.isSpeaking || this.skipping || this.alignmentData.chars.length == 0) {
            console.log("cannot display character since no transcript is being played");
            console.log(`paused:${this.isPaused} speaking:${this.isSpeaking} alignment:${this.skipping}`);
            return;
        }
        // end transcript if we have reached the end of the transcript
        if (this.charPointer >= this.alignmentData.chars.length) {
            this.endTranscript();
            return;
        }
        const curChar = this.alignmentData.chars[this.charPointer];
        const curDurationMs = this.alignmentData.charDurationsMs[this.charPointer];
        const curStartTimeMs = this.alignmentData.charStartTimesMs[this.charPointer];
        if (this.audioElement) {
            // audio will play, since the audio element is set
            if (this.audioElement.currentTime * 1000 >= curStartTimeMs) {
                this.displayedTranscript += curChar;
                if (this.onTranscriptUpdate) {
                    this.onTranscriptUpdate(this.displayedTranscript, curDurationMs);
                }
                this.charPointer++;
                // If there are more characters to display, wait until the next character's start time and display it
                if (this.charPointer < this.alignmentData.chars.length) {
                    this.currentTimeout = setTimeout(() => {
                        this.displayNextCharacter(); // Continue to the next character
                    }, Math.max(0, curStartTimeMs - this.audioElement.currentTime * 1000)); // wait until it's time for the next character
                }
                else {
                    this.endTranscript();
                }
            }
            else {
                // if the transcript is ahead of the audio, wait until it isn't
                if (this.charPointer < this.alignmentData.chars.length) {
                    this.currentTimeout = setTimeout(() => {
                        this.displayNextCharacter(); // Continue to the next character
                    }, Math.max(0, curStartTimeMs - this.audioElement.currentTime * 1000));
                }
                else {
                    this.endTranscript();
                }
            }
        }
        else {
            // no audio will play, since the audio element is not set
            this.displayedTranscript = this.displayedTranscript + curChar;
            if (this.onTranscriptUpdate) {
                this.onTranscriptUpdate(this.displayedTranscript, curDurationMs);
            }
            this.charPointer++;
            if (this.charPointer < this.alignmentData.chars.length) {
                this.currentTimeout = setTimeout(() => {
                    this.displayNextCharacter(); // wait until it's time for the next character
                }, curDurationMs);
            }
            else {
                this.endTranscript();
            }
        }
    }
    /**
     * Pauses the transcript playback.
     */
    pauseSpeaking() {
        var _a;
        if (this.isSpeaking && !this.isPaused) {
            (_a = this.audioElement) === null || _a === void 0 ? void 0 : _a.pause();
            this.isPaused = true;
            if (this.currentTimeout) {
                clearTimeout(this.currentTimeout); // Stop the ongoing timeout
            }
            console.log('Speech paused');
        }
        else {
            if (!this.isSpeaking) {
                console.error("Cannot pause transcript playback while no transcript is currently being spoken");
            }
        }
    }
    /**
     * Resumes the transcript playback after being paused.
     */
    resumeSpeaking() {
        var _a;
        if (this.isPaused && this.isSpeaking) {
            (_a = this.audioElement) === null || _a === void 0 ? void 0 : _a.play();
            this.isPaused = false;
            console.log('Speech resumed');
            this.displayNextCharacter(); // Resume displaying the next character
        }
        else {
            console.error("Cannot resume transcript playback while no transcript is currently being spoken");
        }
    }
    /**
     * Skips to the end of the current transcript, goes to the next in the queue.
     */
    skipTranscript() {
        if (this.isSpeaking) {
            this.skipping = true;
            console.log('Speech skipped');
            if (this.currentTimeout) {
                clearTimeout(this.currentTimeout);
                this.currentTimeout = null; // Reset the currentTimeout to null after clearing it
            }
            this.endTranscript();
            this.skipping = false;
        }
        else {
            console.error("Cannot skip transcript playback as no transcript is currently being spoken");
        }
    }
    /**
     * Starts transcript playback from the beginning.
     */
    restartTranscript() {
        if (this.isSpeaking) {
            this.displayedTranscript = "";
            this.isPaused = false;
            this.charPointer = 0;
            this.currentTimeout = null;
            if (this.audioElement) {
                this.audioElement.load();
                this.audioElement.currentTime = 0;
                this.audioElement.play();
            }
            this.displayNextCharacter();
        }
        else {
            console.error("Cannot restart transcript as no transcript is currently being spoken");
        }
    }
    /**
     * Cleans up the internal states of the TTS, plays the next transcript.
     */
    endTranscript() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            if (this.isSpeaking) {
                (_a = this.controller) === null || _a === void 0 ? void 0 : _a.abort("Transcript Skipped, abort fetch");
                console.log("End of speech");
                // set internal state back to initial state
                this.isSpeaking = false;
                this.isPaused = false;
                this.charPointer = 0; // Tracks where we are in the alignment data
                this.alignmentData = { chars: [], charStartTimesMs: [], charDurationsMs: [] };
                this.currentTimeout = null; // Stores the timeout reference for pausing/resuming
                this.displayedTranscript = "";
                // if audio is playing, pause it.
                (_b = this.audioElement) === null || _b === void 0 ? void 0 : _b.pause();
                if (this.onTranscriptEnd) {
                    this.onTranscriptEnd();
                }
                // queue the next transcript
                const nextTranscript = this.transcriptQueue.shift();
                if (nextTranscript) {
                    yield this.speak(nextTranscript);
                }
            }
            else {
                console.error("Cannot end transcript as no transcript is currently being spoken");
            }
        });
    }
}
