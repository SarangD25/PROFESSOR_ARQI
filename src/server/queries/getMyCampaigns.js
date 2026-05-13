export async function getMyCampaigns(args, context) {
  if (!context.user) return [];
  return context.entities.Campaign.findMany({
    where: { teacherId: context.user.id },
    include: {
      _count: { select: { qrPapers: true } },
      qrPapers: { include: { questionSets: true } }
    },
    orderBy: { createdAt: 'desc' }
  });
}
