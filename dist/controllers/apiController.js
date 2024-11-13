"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const dotenv = __importStar(require("dotenv"));
dotenv.config();
let api_key = "";
if (process.env.ELEVENLABS_API_KEY) {
    api_key = process.env.ELEVENLABS_API_KEY;
}
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
        "xi-api-key": api_key,
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
        return returnJson;
    }
    catch (error) {
        console.error('Error fetching TTS alignment (in apiController function):', error);
        return null;
    }
});
exports.getTextToSpeechAlignment = getTextToSpeechAlignment;
