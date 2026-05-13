/**
 * Groq API utility with auto-retry on rate limits.
 * Free tier: 30 req/min, 14,400 req/day.
 * Get your API key at: https://console.groq.com/keys
 *
 * FIX: Removed response_format: { type: 'json_object' } — it forces Groq to
 * wrap arrays in an object like { "questions": [...] }, breaking JSON parsing
 * and confusing the model so it generates wrong answers.
 * Instead we use a strict system prompt + parseAndValidate to extract the array.
 */

const MAX_RETRIES = 3;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function callGroq(prompt) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('GROQ_API_KEY is not set. Get one free at https://console.groq.com/keys');
  }

  const model = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
  const url = 'https://api.groq.com/openai/v1/chat/completions';

  const body = {
    model: model,
    messages: [
      {
        role: 'system',
        // KEY FIX: Tell model to return a raw JSON array, not an object.
        // This works WITH the buildPrompt() template which expects [...].
        content: `You are an expert competitive exam question setter for GATE, JEE, and UPSC.
Your ONLY job is to return a valid JSON array of questions.
Rules:
- Return ONLY the raw JSON array starting with [ and ending with ]
- No markdown, no code fences, no explanation, no wrapper object
- Each correctAnswer for MCQ must be exactly one letter: A, B, C, or D
- Verify every answer mathematically/logically before including it
- Never guess — if unsure about a calculation, simplify the numbers`
      },
      { role: 'user', content: prompt }
    ],
    temperature: 0.1,   // LOW temperature = accurate answers, less hallucination
    max_tokens: 4096,
    // NO response_format here — that was the root cause of wrong answers
  };

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(body)
      });

      if (res.ok) {
        const data = await res.json();
        const text = data.choices?.[0]?.message?.content;
        if (!text) throw new Error('Empty response from Groq API');
        return text;
      }

      if (res.status === 429) {
        const errorData = await res.json().catch(() => ({}));
        const msg = errorData.error?.message || '';
        let retryDelay = 20;
        const match = msg.match(/try again in (\d+\.?\d*)/i);
        if (match) retryDelay = Math.ceil(parseFloat(match[1])) + 2;

        if (attempt < MAX_RETRIES) {
          console.log(`[Groq] Rate limited. Waiting ${retryDelay}s before retry ${attempt + 1}/${MAX_RETRIES}...`);
          await sleep(retryDelay * 1000);
          continue;
        }
        throw new Error(`Groq API rate limited after ${MAX_RETRIES} retries.`);
      }

      const errorText = await res.text();
      throw new Error(`Groq API error (${res.status}): ${errorText}`);

    } catch (err) {
      if (attempt === MAX_RETRIES) throw err;
      if (!err.message.includes('429') && !err.message.includes('rate')) throw err;
      console.log(`[Groq] Retry ${attempt + 1}/${MAX_RETRIES}...`);
      await sleep(20000);
    }
  }
}
