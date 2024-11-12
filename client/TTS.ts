export class TTS {
    private static instance: TTS;

    // Internal state
    private isSpeaking: boolean = false;
    private audioElement: HTMLAudioElement | null = null;
    private displayedTranscript: string = "";
    private isPaused: boolean = false;
    private charPointer: number = 0;  // Tracks where we are in the alignment data
    private transcriptQueue: string[] = [];
    

    private alignmentData: { chars: string[]; charStartTimesMs: number[]; charDurationsMs: number[] } 
        = {chars: [], charStartTimesMs: [], charDurationsMs:[]};  // Holds the fetched alignment data
    private currentTimeout: NodeJS.Timeout | null = null; // Stores the timeout reference for pausing/resuming
    
    // public abstract methods
    public onTranscriptUpdate?: (transcript: string, speechStartMs: number) => Promise<void>;
    public onTranscriptEnd?: () => Promise<void>;

    // Private constructor to prevent instantiation
    private constructor() {}

    // Get the singleton instance
    public static getInstance(): TTS {
        if (!TTS.instance) {
            TTS.instance = new TTS();
        }
        return TTS.instance;
    }

    // public getter methods

    public getIsSpeaking(): boolean {
        return this.isSpeaking;
    }

    public setAudioElement(audioElement: HTMLAudioElement): void {
        this.audioElement = audioElement;
    }

    public getQueueSize(): number {
        return this.transcriptQueue.length;
    }

    public getTranscriptDisplay(): string {
        return this.displayedTranscript;
    }

    /**
     * Sets this.alignmentData.charDurationsMs to the duration that each character should appear on the screen in ms.
     *
     * @param character_start_times_seconds The timestamp start of every character as it is spoken in the audio file, (s).
     * @param character_end_times_seconds The timestamp end of every character as it is spoken in the audio file, (s).
     * @returns void 
     */
    private setCharacterDurations(character_start_times_seconds: number[], character_end_times_seconds: number[] ): void {
        // Ensure that the start and end times arrays have the same length
        if (character_start_times_seconds.length !== character_end_times_seconds.length) {
            throw new Error("Start and end times arrays must have the same length");
        }
      
        // Calculate the duration for each character (in seconds)
        const durationsInMs:number[] = character_start_times_seconds.map((startTime, index) => {
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
    private setCharStartTimesMs(character_start_times_seconds: number[]): void {
        const startTimesInMs:number[] = character_start_times_seconds.map((startTime) => {
            return startTime * 1000;
        });
        this.alignmentData.charStartTimesMs = startTimesInMs;
    }
    
    /**
     * Begins updating the transcript, adding characters to the display. Audio will be played if the audioElement field is non-null.
     *
     * @param textInput The transcript that will be displayed
     */
    public async speak(textInput: string): Promise<void> {
        if (this.isSpeaking) {
            this.transcriptQueue.push(textInput);
            return;
        } else {
            this.isSpeaking = true;
        }
        
        try {
            // Fetch alignment data from the API
            const response = await fetch('/api/tts-alignment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: textInput }),
            });

            const data = await response.json();

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
                this.isPaused = false;

                this.displayNextCharacter();
                
            } else {
                console.error('Failed to fetch alignment data');
            }
        } catch (error) {
            console.error('Error fetching alignment data:', error);
        }
    }

    /**
     * 
     * Helper method for "speak". Continuously displays characters from the text
     * passed to "speak" until there are none left.
     * Begins updating the transcript, adding characters to the display. 
     * Audio will be played and characters will by synchronized to the audio if the audioElement 
     * field is non-null. Otherwise, characters will still display with proper ms gaps between them.
     */
    private displayNextCharacter(): void {
        // Stop if paused or end of data
        if (this.isPaused || !this.isSpeaking || !this.alignmentData) {
            return; 
        }

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
                } else {
                    this.endTranscript();
                }
            } else {
                // if the transcript is ahead of the audio, wait until it isn't
                if (this.charPointer < this.alignmentData.chars.length) {
                    this.currentTimeout = setTimeout(() => {
                        this.displayNextCharacter(); // Continue to the next character
                    }, Math.max(0, curStartTimeMs - this.audioElement.currentTime * 1000));
                } else {
                    this.endTranscript();
                }
            }
        } else {
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
            } else {
                this.endTranscript();
            }
        }
    }

    /**
     * Pauses the transcript playback.
     */
    public pauseSpeaking(): void {
        if (this.isSpeaking && !this.isPaused) {
            this.audioElement?.pause();

            this.isPaused = true;
            if (this.currentTimeout) {
                clearTimeout(this.currentTimeout);  // Stop the ongoing timeout
            }
            console.log('Speech paused');
        }
    }

    /**
     * Resumes the transcript playback after being paused. 
     */
    public resumeSpeaking(): void {
        if (this.isPaused) {
            this.audioElement?.play();

            this.isPaused = false;
            console.log('Speech resumed');
            this.displayNextCharacter();  // Resume displaying the next character
        }
        
    }

    /**
     * Skips to the end of the current transcript, goes to the next in the queue.
     */
    public skipTranscript(): void {
        console.log('Speech skipped');
        this.audioElement?.pause();
        this.endTranscript();
    }

    /**
     * Starts transcript playback from the beginning.
     */
    public restartTranscript(): void {
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
    }

    /**
     * Cleans up the internal states of the TTS, plays the next transcript.
     */
    private endTranscript(): void {
        console.log("End of speech");
        this.isSpeaking = false;
        this.isPaused = false;
        this.charPointer = 0;  // Tracks where we are in the alignment data
        
        this.alignmentData = {chars: [], charStartTimesMs: [], charDurationsMs:[]};
        this.currentTimeout = null; // Stores the timeout reference for pausing/resuming
        this.displayedTranscript = "";

        if (this.audioElement){
            this.audioElement.src = "";
            this.audioElement.load();
        }

        if (this.onTranscriptEnd) {
            this.onTranscriptEnd();
        }

        const nextTranscript = this.transcriptQueue.shift();
        if (nextTranscript){
            this.speak(nextTranscript);
        }
    }
}
