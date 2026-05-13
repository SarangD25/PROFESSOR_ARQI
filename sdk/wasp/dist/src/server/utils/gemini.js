/**
 * Gemini API utility with auto-retry on rate limits.
 * Free tier: 15 RPM, 1500 RPD via Google AI Studio.
 * Get your API key at: https://aistudio.google.com/apikey
 */
const MAX_RETRIES = 3;
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
export async function callGemini(prompt) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error('GEMINI_API_KEY is not set. Get one free at https://aistudio.google.com/apikey');
    }
    const model = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const body = {
        contents: [{
                parts: [{ text: prompt }]
            }],
        generationConfig: {
            temperature: 0.2,
            topP: 0.95,
            maxOutputTokens: 8192
        }
    };
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            if (res.ok) {
                const data = await res.json();
                const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
                if (!text)
                    throw new Error('Empty response from Gemini API');
                return text;
            }
            // Handle rate limiting (429)
            if (res.status === 429) {
                const errorData = await res.json().catch(() => ({}));
                // Extract retry delay from response
                let retryDelay = 10; // default 10s
                const retryInfo = errorData.error?.details?.find(d => d['@type']?.includes('RetryInfo'));
                if (retryInfo?.retryDelay) {
                    const match = retryInfo.retryDelay.match(/(\d+)/);
                    if (match)
                        retryDelay = parseInt(match[1]);
                }
                if (attempt < MAX_RETRIES) {
                    console.log(`[Gemini] Rate limited. Waiting ${retryDelay}s before retry ${attempt + 1}/${MAX_RETRIES}...`);
                    await sleep(retryDelay * 1000);
                    continue;
                }
                throw new Error(`Gemini API rate limited after ${MAX_RETRIES} retries. Daily quota may be exhausted.`);
            }
            // Handle quota exhaustion (403 RESOURCE_EXHAUSTED)
            if (res.status === 403) {
                const errorData = await res.json().catch(() => ({}));
                const reason = errorData.error?.message || '';
                if (reason.includes('quota') || reason.includes('RESOURCE_EXHAUSTED')) {
                    throw new Error(`Gemini quota exhausted. Falling back to Groq. (${reason.substring(0, 100)})`);
                }
                throw new Error(`Gemini API forbidden (403): ${reason.substring(0, 100)}`);
            }
            // Other errors
            const errorText = await res.text();
            throw new Error(`Gemini API error (${res.status}): ${errorText}`);
        }
        catch (err) {
            if (attempt === MAX_RETRIES)
                throw err;
            if (!err.message.includes('429') && !err.message.includes('rate'))
                throw err;
            // Retry on rate limit errors
            console.log(`[Gemini] Retry ${attempt + 1}/${MAX_RETRIES} after error...`);
            await sleep(15000); // wait 15s
        }
    }
}
//# sourceMappingURL=gemini.js.map