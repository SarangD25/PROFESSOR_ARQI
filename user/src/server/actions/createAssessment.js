export async function createAssessment(args, context) {
    if (!context.user)
        throw new Error('Not authenticated');
    const { orgId, entries } = args;
    // entries: [{ orgStudentId, type, title, marks, maxMarks, description?, date? }]
    const results = [];
    for (const entry of entries) {
        const assessment = await context.entities.Assessment.create({
            data: {
                orgStudentId: entry.orgStudentId,
                orgId,
                type: entry.type,
                title: entry.title,
                description: entry.description || '',
                marks: entry.marks,
                maxMarks: entry.maxMarks,
                date: entry.date ? new Date(entry.date) : new Date(),
                createdBy: context.user.id
            }
        });
        results.push(assessment);
    }
    return results;
}
