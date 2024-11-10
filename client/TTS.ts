export class TTS {
    private static instance: TTS;

    // Internal state
    private isSpeaking: boolean = false;
    private isPaused: boolean = false;
    private charPointer: number = 0;  // Tracks where we are in the alignment data

    private alignmentData: { chars: string[]; charStartTimesMs: number[]; charDurationsMs: number[] } 
        = {chars: [], charStartTimesMs: [], charDurationsMs:[]};  // Holds the fetched alignment data
    private currentTimeout: NodeJS.Timeout | null = null; // Stores the timeout reference for pausing/resuming
    public displayedTranscript: string = "";

    // public abstract method
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

    private getCharacterDurations(data: { alignment: { characters: string[], character_start_times_seconds: number[], character_end_times_seconds: number[] } }) {
        // Ensure that the start and end times arrays have the same length
        if (data.alignment.character_start_times_seconds.length !== data.alignment.character_end_times_seconds.length) {
            throw new Error("Start and end times arrays must have the same length");
        }
      
        // Calculate the duration for each character (in seconds)
        const durationsInMs = data.alignment.character_start_times_seconds.map((startTime, index) => {
          const endTime = data.alignment.character_end_times_seconds[index];
          return (endTime - startTime) * 1000; // Duration in seconds
        });
      
        return durationsInMs; 
    }

    

    // Public method to fetch alignment data from the API and start speaking
    public async speak(textInput: string): Promise<string> {
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
                this.alignmentData.charDurationsMs = this.getCharacterDurations(data);
                
                this.charPointer = 0;
    
                this.displayedTranscript = "";
                if (this.onTranscriptUpdate) {
                    // tell client to wait 0ms and to clear the display
                    this.onTranscriptUpdate("", 0);
                }

                // Start displaying the characters
                this.isSpeaking = true;
                this.isPaused = false;
                this.charPointer = 0;
                this.displayedTranscript = "";
                

                this.displayNextCharacter();
                return data.audio_base64;
            } else {
                alert('Failed to fetch alignment data.');
                return '';
            }
        } catch (error) {
            console.error('Error fetching alignment data:', error);
            return '';
        }
    }

    // Method to display the next character in the alignment data
    private displayNextCharacter(): void {
        if (this.isPaused || this.charPointer >= this.alignmentData.chars.length || !this.alignmentData) {
            return; // Stop if paused or end of data
        }

        

        let curChar = this.alignmentData.chars[this.charPointer];
        let curDuration = this.alignmentData.charDurationsMs[this.charPointer];

        this.displayedTranscript = this.displayedTranscript + curChar;
        if (this.onTranscriptUpdate) {
            this.onTranscriptUpdate(this.displayedTranscript, curDuration);
        }
        this.charPointer++;

        // Set a timeout to display the next character after the duration
        if (this.charPointer < this.alignmentData.chars.length) {
            this.currentTimeout = setTimeout(() => {
                this.displayNextCharacter(); // Recursively call to display the next character
            }, curDuration);
        } else {
            console.log('Speech complete');
            this.endTranscript();
            if (this.onTranscriptEnd) {
                this.onTranscriptEnd();
            }
        }
    }

    // Public method to pause the speech
    public pauseSpeaking(): void {
        if (this.isSpeaking && !this.isPaused) {
            this.isPaused = true;
            if (this.currentTimeout) {
                clearTimeout(this.currentTimeout);  // Stop the ongoing timeout
            }
            console.log('Speech paused');
        }
    }

    // Public method to resume the speech from where it was paused
    public resumeSpeaking(): void {
        if (this.isPaused) {
            this.isPaused = false;
            console.log('Speech resumed');
            this.displayNextCharacter();  // Resume displaying the next character
        }
    }

    private endTranscript(): void {
        this.isSpeaking = false;
        this.isPaused = false;
        this.charPointer = 0;  // Tracks where we are in the alignment data
        
        this.alignmentData = {chars: [], charStartTimesMs: [], charDurationsMs:[]};
        this.currentTimeout = null; // Stores the timeout reference for pausing/resuming
        this.displayedTranscript = "";
    }

}
