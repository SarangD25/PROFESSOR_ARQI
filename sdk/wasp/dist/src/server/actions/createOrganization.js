export async function createOrganization(args, context) {
    if (!context.user)
        throw new Error('Not authenticated');
    const existing = await context.entities.Organization.findUnique({ where: { name: args.name } });
    if (existing)
        throw new Error('Organization name already taken');
    return context.entities.Organization.create({
        data: { name: args.name, teacherId: context.user.id }
    });
}
//# sourceMappingURL=createOrganization.js.map