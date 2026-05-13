export async function callOllama(prompt, model = process.env.OLLAMA_MODEL, useJson = false) {
    const body = {
        model,
        prompt,
        stream: false,
        options: {
            temperature: 0.7,
            num_predict: 2048,
            top_p: 0.9,
            repeat_penalty: 1.3
        }
    };
    if (useJson)
        body.format = 'json';
    const res = await fetch(process.env.OLLAMA_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });
    const data = await res.json();
    return data.response;
}
