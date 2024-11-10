"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTextToSpeechAlignment = void 0;
const constants_1 = require("../constants");
const getTextToSpeechAlignment = (inputText) => __awaiter(void 0, void 0, void 0, function* () {
    const mytext = yield inputText;
    const voice_id = "21m00Tcm4TlvDq8ikWAM"; // Rachel
    const data = JSON.stringify({
        text: mytext,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
            "stability": 0.5,
            "similarity_boost": 0.75
        }
    });
    const headers = {
        "Content-Type": "application/json",
        "xi-api-key": constants_1.API_KEY,
    };
    const url = `https://api.elevenlabs.io/v1/text-to-speech/${voice_id}/with-timestamps`;
    try {
        const response = yield fetch(url, {
            method: 'POST',
            headers: headers,
            body: data,
        });
        if (!response.ok) {
            throw new Error(`Failed to fetch: ${response.statusText}`);
        }
        const returnJson = yield response.json();
        console.log(returnJson);
        return returnJson;
    }
    catch (error) {
        console.error('Error fetching TTS alignment (in apiController function):', error);
        return null;
    }
});
exports.getTextToSpeechAlignment = getTextToSpeechAlignment;
