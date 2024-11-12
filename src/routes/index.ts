import express, { Request, Response } from 'express'; 
import { getTextToSpeechAlignment } from '../controllers/apiController';

const router = express.Router();

// Endpoint to get the TTS alignment data for a given text

// Serve the static HTML page
router.get('/', (req, res) => {
    res.sendFile('index.html', { root: 'public' });
});

router.post('/api/tts-alignment', async (req, res) => {

  if (!req.body) {
    res.status(400).json({ error: 'Could not process Request'});
  }
  
  const { text } = req.body;

  if (!text) {
    res.status(400).json({ error: 'Text is required' });
  }

  const alignmentData = await getTextToSpeechAlignment(text);

  if (!alignmentData) {
    res.status(500).json({ error: 'Failed to get TTS alignment data' });
  }

  res.json(alignmentData);
});

export default router;
