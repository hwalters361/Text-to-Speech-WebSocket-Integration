// import axios from 'axios';

export const getTextToSpeechAlignment = async (text: string) => {
  try {
    // Simulating an API call to get the TTS alignment data
    // Replace with an actual API call if needed
    // const response = await axios.post('http://example.com/tts-api', { text });
    
    // return response.data; // Contains audio samples, chars, charStartTimesMs, and charDurationsMs
    const returnJson = {
        "audio": Float32Array,  // Audio samples in Base64 format
        "alignment": {
          "chars": [
            "S", "h", "i", "r", "l", "e", "y", ",", " ",
            "a", "n", " ", "a", "n", "c", "i", "e", "n", "t", " ",
            "v", "a", "m", "p", "i", "r", "e", ",", " ",
            "b", "o", "a", "r", "d", "e", "d"
          ],
          "charStartTimesMs": [
            0, 104, 174, 244, 325, 406, 464, 522, 557,
            580, 627, 685, 778, 848, 929, 987, 1033, 1068, 1103, 1161,
            1219, 1277, 1393, 1474, 1567, 1741, 1811, 1962, 2009,
            2252, 2345, 2438, 2473, 2519, 2577, 2647
          ],
          "charDurationsMs": [
            104, 70, 70, 81, 81, 58, 58, 35, 23,
            47, 58, 93, 70, 81, 58, 46, 35, 35, 58, 58,
            58, 116, 81, 93, 174, 70, 151, 47, 243,
            93, 93, 35, 46, 58, 70, 93
          ]
        }
      }
      return returnJson;
  } catch (error) {
    console.error('Error fetching TTS alignment (in apiController function):', error);
    return null;
  }
};
