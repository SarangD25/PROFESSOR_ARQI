export async function deleteCampaign(args, context) {
    if (!context.user)
        return null;
    const { campaignId } = args;
    // Get all QR papers for this campaign
    const papers = await context.entities.QRPaper.findMany({
        where: { campaignId },
        include: { questionSets: true }
    });
    // Cascade: Attempts → QuestionSets → QRPapers → Campaign
    for (const paper of papers) {
        for (const qs of paper.questionSets) {
            await context.entities.Attempt.deleteMany({ where: { questionSetId: qs.id } });
        }
        await context.entities.QuestionSet.deleteMany({ where: { qrPaperId: paper.id } });
    }
    await context.entities.QRPaper.deleteMany({ where: { campaignId } });
    await context.entities.Campaign.delete({ where: { id: campaignId } });
    return { success: true };
}
