import { API_KEY } from '../constants';

export const getTextToSpeechAlignment = async (inputText: string) => {
  const mytext: string = await inputText;
  const voice_id: string = "21m00Tcm4TlvDq8ikWAM";  // Rachel
  const data: BodyInit = JSON.stringify({
    text: mytext,
    model_id: "eleven_multilingual_v2",
    voice_settings: {
      "stability": 0.5,
      "similarity_boost": 0.75
    }
  });
  const headers = {
    "Content-Type": "application/json",
    "xi-api-key": API_KEY,
  };
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${voice_id}/with-timestamps`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: data,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.statusText}`);
    }

    const returnJson = await response.json();
    console.log(returnJson);
    return returnJson;
  } catch (error) {
    console.error('Error fetching TTS alignment (in apiController function):', error);
    return null;
  }
};
