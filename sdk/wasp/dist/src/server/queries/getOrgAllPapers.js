export async function getOrgAllPapers(args, context) {
    if (!context.user)
        return [];
    // Get all campaigns owned by this teacher
    const campaigns = await context.entities.Campaign.findMany({
        where: { teacherId: context.user.id },
        select: { id: true }
    });
    if (!campaigns.length)
        return [];
    // Get ALL papers across all their campaigns
    return context.entities.QRPaper.findMany({
        where: {
            campaignId: { in: campaigns.map(c => c.id) }
        },
        include: {
            campaign: true,
            orgStudent: true,
            questionSets: { include: { attempts: true } }
        },
        orderBy: { createdAt: 'desc' }
    });
}
//# sourceMappingURL=getOrgAllPapers.js.map