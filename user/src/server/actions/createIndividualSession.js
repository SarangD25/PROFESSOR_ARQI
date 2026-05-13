export async function createIndividualSession(args, context) {
    if (!context.user)
        throw new Error('Not authenticated');
    // Create a personal campaign for this student
    const campaign = await context.entities.Campaign.create({
        data: {
            title: args.title || (args.examName + ' - ' + args.topic),
            examName: args.examName,
            topic: args.topic,
            difficulty: args.difficulty,
            deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
            teacherId: context.user.id,
            mode: 'individual'
        }
    });
    return campaign;
}
