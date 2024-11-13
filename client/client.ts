import { TTS } from './TTS.js'; // Assuming TTS is in a separate file

// DOM Elements
const startButton = document.getElementById('startButton') as HTMLButtonElement;
const pauseButton = document.getElementById('pauseButton') as HTMLButtonElement;
const resumeButton = document.getElementById('resumeButton') as HTMLButtonElement;
const skipButton = document.getElementById('skipButton') as HTMLButtonElement;
const restartButton = document.getElementById('restartButton') as HTMLButtonElement;
const displayText = document.getElementById('displayText') as HTMLDivElement;
const textInput = document.getElementById('textInput') as HTMLTextAreaElement;
const audioElement = document.getElementById("audioElement") as HTMLAudioElement;
const queueSize = document.getElementById("queueSize") as HTMLAudioElement;


// Get the singleton TTS instance
const tts = TTS.getInstance();

// set the audio element. Comment out to disable audio playback
tts.setAudioElement(audioElement);

tts.onTranscriptUpdate = async (transcript: string, speechStartMs: number) => {
  displayText.textContent = tts.getTranscriptDisplay();
  queueSize.innerText = `${tts.getQueueSize()} transcript(s) are queued`;
  pauseButton.disabled = false;
  resumeButton.disabled = true;
  restartButton.disabled = false;
};

tts.onTranscriptEnd = async () => {
  pauseButton.disabled = true;
  resumeButton.disabled = true;
  restartButton.disabled = true;
  queueSize.innerText = `${tts.getQueueSize()} transcript(s) are queued`;
  if (!tts.getIsSpeaking()) {
    queueSize.innerText = `All transcripts finished playback.`;
  }
}

// Button Event Listeners

// Start the speech when the "Start Speaking" button is clicked
startButton.addEventListener('click', async () => {
  // Get the text from the textarea
  if (!textInput) {
    alert("Please enter some text.");
    return;
  }
  const textToSpeak = textInput.value;

  skipButton.disabled = false;

  // Check if there is any text entered
  if (textToSpeak.trim() === '') {
    alert("Please enter some text.");
    return;
  }

  await tts.speak(textToSpeak);

  queueSize.innerText = `${tts.getQueueSize()} transcript(s) are queued`;
});

// Pause the speech when the "Pause" button is clicked
pauseButton.addEventListener('click', () => {
  tts.pauseSpeaking();
 pauseButton.disabled = true;
 resumeButton.disabled = false;
});

// Resume the speech when the "Resume" button is clicked
resumeButton.addEventListener('click', () => {
  tts.resumeSpeaking();
  pauseButton.disabled = false;
  resumeButton.disabled = true;
});

skipButton.addEventListener('click', () => {
  tts.skipTranscript();
  queueSize.innerText = `${tts.getQueueSize()} transcript(s) are queued`;
  if (!tts.getIsSpeaking()) {
    queueSize.innerText = `All transcripts finished playback.`;
  }
});

restartButton.addEventListener('click', () => {
  tts.restartTranscript();
});