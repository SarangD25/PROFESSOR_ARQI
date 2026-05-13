export async function getStudentPapers(args, context) {
    if (!context.user)
        return [];
    return context.entities.QRPaper.findMany({
        where: { studentId: context.user.id },
        include: {
            campaign: true,
            questionSets: { include: { attempts: true } }
        },
        orderBy: { createdAt: 'desc' }
    });
}
