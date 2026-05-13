import { computeStudentScore, getTier, getRecommendedDifficulty } from '../utils/scoring.js';

export async function getStudentSegregation(args, context) {
  if (!context.user) return [];
  const { orgId } = args;

  // Load weight config
  const config = await context.entities.OrgConfig.findUnique({ where: { orgId } });
  const weights = config ? {
    assignment: config.weightAssignment,
    behavior: config.weightBehavior,
    performance: config.weightPerformance,
    classTest: config.weightClassTest
  } : undefined;

  const students = await context.entities.OrgStudent.findMany({ where: { orgId } });
  const results = [];

  for (const student of students) {
    // Get assessments for this student
    const assessments = await context.entities.Assessment.findMany({
      where: { orgStudentId: student.id }
    });

    // Get class test attempts
    const qrPapers = await context.entities.QRPaper.findMany({
      where: { orgStudentId: student.id },
      include: { questionSets: { include: { attempts: true } } }
    });
    const classTestAttempts = [];
    for (const paper of qrPapers) {
      for (const qs of paper.questionSets) {
        for (const a of qs.attempts) classTestAttempts.push(a);
      }
    }

    const { breakdown, combinedScore } = computeStudentScore(assessments, classTestAttempts, weights);

    results.push({
      ...student,
      combinedScore,
      tier: getTier(combinedScore),
      recommendedDifficulty: getRecommendedDifficulty(combinedScore),
      breakdown
    });
  }

  // Sort by score descending
  results.sort((a, b) => b.combinedScore - a.combinedScore);
  return results;
}
