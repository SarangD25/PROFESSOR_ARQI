export async function getMyOrganization(args, context) {
  if (!context.user) return null;
  return context.entities.Organization.findFirst({
    where: { teacherId: context.user.id },
    include: {
      _count: { select: { students: true, campaigns: true } },
      campaigns: { orderBy: { createdAt: 'desc' }, take: 5 }
    }
  });
}
