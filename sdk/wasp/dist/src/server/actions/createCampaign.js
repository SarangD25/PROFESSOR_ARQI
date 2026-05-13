export async function createCampaign(args, context) {
    if (!context.user)
        throw new Error('Not authenticated');
    return context.entities.Campaign.create({
        data: {
            title: args.title,
            examName: args.examName,
            topic: args.topic,
            difficulty: args.difficulty,
            deadline: new Date(args.deadline),
            teacherId: context.user.id,
            orgId: args.orgId || null,
            mode: args.mode || 'individual'
        }
    });
}
//# sourceMappingURL=createCampaign.js.map