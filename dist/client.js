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
const displayText = document.getElementById('displayText');
const textInput = document.getElementById('textInput');
// Get the singleton TTS instance
const tts = TTS.getInstance();
//initialize buttons
startButton.disabled = false;
pauseButton.disabled = true;
resumeButton.disabled = true;
tts.onTranscriptUpdate = (transcript, speechStartMs) => __awaiter(void 0, void 0, void 0, function* () {
    // Update the displayed text in the DOM
    displayText.textContent = tts.displayedTranscript;
    // Optionally, you could also log the speech start time, if you need it
    console.log(`Current Transcript: ${transcript}`);
    console.log(`Speech started at: ${speechStartMs} ms`);
});
tts.onTranscriptEnd = () => __awaiter(void 0, void 0, void 0, function* () {
    console.log("over");
    startButton.disabled = false;
    pauseButton.disabled = true;
    resumeButton.disabled = true;
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
    // Check if there is any text entered
    if (textToSpeak.trim() === '') {
        alert("Please enter some text.");
        return;
    }
    // Call the TTS function (assuming tts.speak is defined elsewhere in your code)
    yield tts.speak(textToSpeak);
    // Enable/Disable buttons based on speech state
    startButton.disabled = true;
    pauseButton.disabled = false;
    resumeButton.disabled = true;
}));
// Pause the speech when the "Pause" button is clicked
pauseButton.addEventListener('click', () => {
    tts.pauseSpeaking();
    // Enable the "Resume" button and disable the "Pause" button
    startButton.disabled = true;
    pauseButton.disabled = true;
    resumeButton.disabled = false;
});
// Resume the speech when the "Resume" button is clicked
resumeButton.addEventListener('click', () => {
    tts.resumeSpeaking();
    startButton.disabled = true;
    pauseButton.disabled = false;
    resumeButton.disabled = true;
});
