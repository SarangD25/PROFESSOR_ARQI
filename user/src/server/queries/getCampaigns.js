export async function getCampaigns(args, context) {
    if (!context.user)
        return [];
    return context.entities.Campaign.findMany({
        where: { mode: 'individual' },
        include: { _count: { select: { qrPapers: true } } },
        orderBy: { createdAt: 'desc' }
    });
}
