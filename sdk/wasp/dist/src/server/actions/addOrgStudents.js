export async function addOrgStudents(args, context) {
    if (!context.user)
        throw new Error('Not authenticated');
    const { orgId, students } = args;
    const results = [];
    for (const s of students) {
        const student = await context.entities.OrgStudent.upsert({
            where: { rollNo_orgId: { rollNo: s.rollNo, orgId } },
            update: { name: s.name, section: s.section || '' },
            create: { name: s.name, rollNo: s.rollNo, section: s.section || '', orgId }
        });
        results.push(student);
    }
    return results;
}
//# sourceMappingURL=addOrgStudents.js.map