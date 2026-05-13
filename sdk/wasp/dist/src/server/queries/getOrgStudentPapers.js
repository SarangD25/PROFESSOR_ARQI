export async function getOrgStudentPapers(args, context) {
    if (!context.user)
        return [];
    const { orgStudentId } = args;
    return context.entities.QRPaper.findMany({
        where: { orgStudentId },
        include: {
            campaign: true,
            questionSets: { include: { attempts: true } }
        },
        orderBy: { createdAt: 'desc' }
    });
}
//# sourceMappingURL=getOrgStudentPapers.js.map