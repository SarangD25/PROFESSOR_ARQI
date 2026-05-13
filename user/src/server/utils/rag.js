export async function getRelevantContext(examName, topic, userWeakConcepts = []) {
    // RAG temporarily disabled - returns empty context
    // TODO: Set up Supabase vector search
    return `Exam: ${examName}, Topic: ${topic}`;
}
