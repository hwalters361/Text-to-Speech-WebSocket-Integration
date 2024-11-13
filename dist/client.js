var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { TTS } from './TTS.js'; // Assuming TTS is in a separate file
// DOM Elements
const startButton = document.getElementById('startButton');
const pauseButton = document.getElementById('pauseButton');
const resumeButton = document.getElementById('resumeButton');
const skipButton = document.getElementById('skipButton');
const restartButton = document.getElementById('restartButton');
const displayText = document.getElementById('displayText');
const textInput = document.getElementById('textInput');
const audioElement = document.getElementById("audioElement");
const queueSize = document.getElementById("queueSize");
// Get the singleton TTS instance
const tts = TTS.getInstance();
// set the audio element. Comment out to disable audio playback
tts.setAudioElement(audioElement);
tts.onTranscriptUpdate = (transcript, speechStartMs) => __awaiter(void 0, void 0, void 0, function* () {
    displayText.textContent = tts.getTranscriptDisplay();
    queueSize.innerText = `${tts.getQueueSize()} transcript(s) are queued`;
    pauseButton.disabled = false;
    resumeButton.disabled = true;
    restartButton.disabled = false;
});
tts.onTranscriptEnd = () => __awaiter(void 0, void 0, void 0, function* () {
    pauseButton.disabled = true;
    resumeButton.disabled = true;
    restartButton.disabled = true;
    queueSize.innerText = `${tts.getQueueSize()} transcript(s) are queued`;
    if (!tts.getIsSpeaking()) {
        queueSize.innerText = `All transcripts finished playback.`;
    }
});
// Button Event Listeners
// Start the speech when the "Start Speaking" button is clicked
startButton.addEventListener('click', () => __awaiter(void 0, void 0, void 0, function* () {
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
    yield tts.speak(textToSpeak);
    queueSize.innerText = `${tts.getQueueSize()} transcript(s) are queued`;
}));
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
