export async function getMe(args, context) {
    if (!context.user)
        return null;
    return context.entities.User.findUnique({ where: { id: context.user.id } });
}
//# sourceMappingURL=getMe.js.map