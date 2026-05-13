export async function deletePaper(args, context) {
  if (!context.user) throw new Error('Not authenticated');
  const { paperId } = args;

  // Cascade delete: Attempts → QuestionSets → QRPaper
  const questionSets = await context.entities.QuestionSet.findMany({
    where: { qrPaperId: paperId }
  });

  for (const qs of questionSets) {
    await context.entities.Attempt.deleteMany({ where: { questionSetId: qs.id } });
  }
  await context.entities.QuestionSet.deleteMany({ where: { qrPaperId: paperId } });
  await context.entities.QRPaper.delete({ where: { id: paperId } });

  return { success: true };
}
