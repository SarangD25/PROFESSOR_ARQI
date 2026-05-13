export async function deleteAssessment(args, context) {
  if (!context.user) throw new Error('Not authenticated');
  return context.entities.Assessment.delete({ where: { id: args.id } });
}
