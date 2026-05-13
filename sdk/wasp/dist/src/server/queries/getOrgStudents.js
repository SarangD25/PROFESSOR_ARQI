export async function getOrgStudents(args, context) {
    if (!context.user)
        return [];
    const { orgId } = args;
    return context.entities.OrgStudent.findMany({
        where: { orgId },
        include: { _count: { select: { qrPapers: true } } },
        orderBy: [{ section: 'asc' }, { rollNo: 'asc' }]
    });
}
//# sourceMappingURL=getOrgStudents.js.map