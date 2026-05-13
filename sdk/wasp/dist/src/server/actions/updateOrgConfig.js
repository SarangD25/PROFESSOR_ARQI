export async function updateOrgConfig(args, context) {
    if (!context.user)
        throw new Error('Not authenticated');
    const { orgId, weightAssignment, weightBehavior, weightPerformance, weightClassTest } = args;
    return context.entities.OrgConfig.upsert({
        where: { orgId },
        update: { weightAssignment, weightBehavior, weightPerformance, weightClassTest },
        create: { orgId, weightAssignment, weightBehavior, weightPerformance, weightClassTest }
    });
}
//# sourceMappingURL=updateOrgConfig.js.map