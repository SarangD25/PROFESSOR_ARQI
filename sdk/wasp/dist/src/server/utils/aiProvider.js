/**
 * Unified AI Provider with automatic failover.
 *
 * Priority order (Groq-first — faster, higher quota, better JSON):
 *   Groq → Gemini → Ollama
 *
 * Gemini quota fix: supports key rotation via GEMINI_API_KEY_2, GEMINI_API_KEY_3
 * Set AI_PROVIDER=groq in .env.server for best results.
 */
import { callGemini } from './gemini.js';
import { callGroq } from './groq.js';
import { callOllama } from './ollama.js';
// Gemini key rotation — cycles through up to 3 keys to bypass daily quota
let geminiKeyIndex = 0;
function getNextGeminiKey() {
    const keys = [
        process.env.GEMINI_API_KEY,
        process.env.GEMINI_API_KEY_2,
        process.env.GEMINI_API_KEY_3,
    ].filter(Boolean);
    if (keys.length === 0)
        return null;
    const key = keys[geminiKeyIndex % keys.length];
    geminiKeyIndex++;
    return key;
}
// Wrap callGemini to inject the rotated key
async function callGeminiWithRotation(prompt) {
    const key = getNextGeminiKey();
    if (!key)
        throw new Error('No Gemini API keys configured');
    // Temporarily override env key for this call
    const original = process.env.GEMINI_API_KEY;
    process.env.GEMINI_API_KEY = key;
    try {
        return await callGemini(prompt);
    }
    finally {
        process.env.GEMINI_API_KEY = original;
    }
}
export async function callAI(prompt) {
    const provider = process.env.AI_PROVIDER || 'groq'; // Default to groq now
    if (provider === 'gemini') {
        console.log('[AI Provider] Using Gemini API');
        return await callGeminiWithRotation(prompt);
    }
    if (provider === 'groq') {
        try {
            console.log('[AI Provider] Using Groq API');
            return await callGroq(prompt);
        }
        catch (err) {
            console.error(`[AI Provider] ❌ Groq failed: ${err.message.substring(0, 80)}`);
            // Try Gemini as backup if key available
            const geminiKey = getNextGeminiKey();
            if (geminiKey) {
                console.log('[AI Provider] Falling back to Gemini...');
                return await callGeminiWithRotation(prompt);
            }
            throw err;
        }
    }
    if (provider === 'ollama') {
        console.log('[AI Provider] Using Ollama (local)');
        return await callOllama(prompt, undefined, true);
    }
    // Auto mode: Groq first (best for exam questions), then Gemini, then Ollama
    const hasGemini = !!(process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY_2);
    const providers = [];
    if (process.env.GROQ_API_KEY)
        providers.push({ name: 'Groq', fn: callGroq });
    if (hasGemini)
        providers.push({ name: 'Gemini', fn: callGeminiWithRotation });
    providers.push({ name: 'Ollama', fn: (p) => callOllama(p, undefined, true) });
    for (const { name, fn } of providers) {
        try {
            console.log(`[AI Provider] Trying ${name}...`);
            const result = await fn(prompt);
            console.log(`[AI Provider] ✅ ${name} succeeded`);
            return result;
        }
        catch (err) {
            console.error(`[AI Provider] ❌ ${name} failed: ${err.message.substring(0, 100)}`);
        }
    }
    throw new Error('All AI providers failed. Check your API keys.');
}
//# sourceMappingURL=aiProvider.js.map