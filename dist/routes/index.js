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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const apiController_1 = require("../controllers/apiController");
const router = express_1.default.Router();
// Endpoint to get the TTS alignment data for a given text
// Serve the static HTML page
router.get('/', (req, res) => {
    res.sendFile('index.html', { root: 'public' });
});
router.post('/api/tts-alignment', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.body) {
        res.status(400).json({ error: 'Could not process Request' });
    }
    const { text } = req.body;
    if (!text) {
        res.status(400).json({ error: 'Text is required' });
    }
    const alignmentData = yield (0, apiController_1.getTextToSpeechAlignment)(text);
    if (!alignmentData) {
        res.status(500).json({ error: 'Failed to get TTS alignment data' });
    }
    res.json(alignmentData);
}));
exports.default = router;
