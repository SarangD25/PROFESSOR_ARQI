export async function getOrgAssessments(args, context) {
    if (!context.user)
        return [];
    const where = { orgId: args.orgId };
    if (args.type)
        where.type = args.type;
    if (args.orgStudentId)
        where.orgStudentId = args.orgStudentId;
    return context.entities.Assessment.findMany({
        where,
        include: { orgStudent: true },
        orderBy: { date: 'desc' }
    });
}
