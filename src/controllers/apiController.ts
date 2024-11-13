import * as dotenv from "dotenv";

dotenv.config();
let api_key = "";
if (process.env.ELEVENLABS_API_KEY) {
  let api_key = process.env.ELEVENLABS_API_KEY;
}



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
    "xi-api-key": api_key,
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
    return returnJson;
  } catch (error) {
    console.error('Error fetching TTS alignment (in apiController function):', error);
    return null;
  }
};
