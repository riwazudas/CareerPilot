/**
 * Utility service to call the Gemini API directly from the client side.
 */

const DEFAULT_MODEL = 'gemini-3.1-flash-lite';

/**
 * Sends a prompt to the Gemini API and returns the text response.
 * @param {string} apiKey - The user's Gemini API Key.
 * @param {string} prompt - The prompt text.
 * @param {string} model - The model identifier (defaults to gemini-2.5-flash).
 * @returns {Promise<string>} The AI generated content.
 */
export async function callGemini(apiKey, prompt, model = DEFAULT_MODEL) {
  if (!apiKey) {
    throw new Error('API Key is missing. Please configure it in the Settings.');
  }

  // clean model name if custom isn't fully specified
  const activeModel = model || DEFAULT_MODEL;
  
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${activeModel}:generateContent?key=${apiKey}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.2, // Low temperature for high precision and consistent tailoring
          topK: 40,
          topP: 0.95,
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData?.error?.message || `HTTP error! status: ${response.status}`;
      
      if (response.status === 400 && errorMessage.includes('key')) {
        throw new Error('Invalid API Key. Please check your credentials in the Settings.');
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!candidateText) {
      throw new Error('Unexpected empty response structure from Gemini API.');
    }

    return candidateText;
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw error;
  }
}
