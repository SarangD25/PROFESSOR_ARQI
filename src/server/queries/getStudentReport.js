import { computeStudentScore, getTier, getRecommendedDifficulty } from '../utils/scoring.js';

export async function getStudentReport(args, context) {
  if (!context.user) return null;
  const { orgStudentId } = args;

  const student = await context.entities.OrgStudent.findUnique({ where: { id: orgStudentId } });
  if (!student) throw new Error('Student not found');

  // Get org weight config
  const config = await context.entities.OrgConfig.findUnique({ where: { orgId: student.orgId } });
  const weights = config ? {
    assignment: config.weightAssignment,
    behavior: config.weightBehavior,
    performance: config.weightPerformance,
    classTest: config.weightClassTest
  } : undefined;

  // Get all manual assessments
  const assessments = await context.entities.Assessment.findMany({
    where: { orgStudentId },
    orderBy: { date: 'desc' }
  });

  // Get class test attempts via QRPaper → QuestionSet → Attempt
  const qrPapers = await context.entities.QRPaper.findMany({
    where: { orgStudentId },
    include: { campaign: true, questionSets: { include: { attempts: true } } }
  });

  const classTestAttempts = [];
  for (const paper of qrPapers) {
    for (const qs of paper.questionSets) {
      for (const attempt of qs.attempts) classTestAttempts.push(attempt);
    }
  }

  const { breakdown, combinedScore } = computeStudentScore(assessments, classTestAttempts, weights);
  const tier = getTier(combinedScore);
  const recommendedDifficulty = getRecommendedDifficulty(combinedScore);

  return {
    student,
    breakdown,
    combinedScore,
    tier,
    recommendedDifficulty,
    assessments,
    classTests: qrPapers
  };
}
