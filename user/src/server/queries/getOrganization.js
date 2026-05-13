export async function getOrganization(args, context) {
    if (!context.user)
        throw new Error('Not authenticated');
    return context.entities.Organization.findFirst({
        where: { createdBy: context.user.id },
        include: { _count: { select: { students: true, campaigns: true } } }
    });
}
