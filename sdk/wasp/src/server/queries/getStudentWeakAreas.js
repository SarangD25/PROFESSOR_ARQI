export async function getStudentWeakAreas(args, context) {
  const studentId = context.user.id;
  return context.entities.WeakArea.findMany({ where: { studentId } });
}
