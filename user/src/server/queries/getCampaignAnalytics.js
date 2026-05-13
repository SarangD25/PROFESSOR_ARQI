export async function getCampaignAnalytics(args, context) {
    const { campaignId } = args;
    const campaign = await context.entities.Campaign.findUnique({
        where: { id: campaignId },
        include: { qrPapers: { include: { questionSets: { include: { attempts: true } } } } }
    });
    return { campaignId, totalStudents: campaign?.qrPapers?.length || 0 };
}
