export async function submitAttempt(args, context) {
  const { questionSetId, answers } = args;
  const userId = context.user?.id || null;

  // Get the question set AND its QRPaper to find the org student
  const questionSet = await context.entities.QuestionSet.findUnique({
    where: { id: questionSetId },
    include: { qrPaper: true }
  });
  const questions = JSON.parse(questionSet.questions);

  // Determine the adaptive ID: individual (userId) or org (orgStudentId)
  const orgStudentId = questionSet.qrPaper?.orgStudentId || null;
  const adaptiveId = userId || orgStudentId || null;

  let totalMarks = 0;
  let obtained = 0;
  const conceptResults = {};
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    totalMarks += (q.marks || 0);
    const userAns = answers[i];
    const isCorrect = checkAnswer(userAns, q.correctAnswer, q.type);
    const conceptKey = q.concept || 'General';
    conceptResults[conceptKey] = conceptResults[conceptKey] || { correct: 0, total: 0 };
    conceptResults[conceptKey].total++;
    if (isCorrect) {
      obtained += (q.marks || 0);
      conceptResults[conceptKey].correct++;
    } else {
      if (q.negativeMarks && userAns !== null && userAns !== undefined && userAns !== '') obtained -= q.negativeMarks;

    }
  }

  // Save weak areas for BOTH individual and org students
  if (adaptiveId) {
    for (const [concept, stats] of Object.entries(conceptResults)) {
      const accuracy = stats.correct / stats.total;
      const existing = await context.entities.WeakArea.findUnique({
        where: { studentId_concept: { studentId: adaptiveId, concept } }
      });
      const newStrength = existing ? existing.strength * 0.7 + accuracy * 0.3 : accuracy;
      await context.entities.WeakArea.upsert({
        where: { studentId_concept: { studentId: adaptiveId, concept } },
        update: { strength: newStrength },
        create: { studentId: adaptiveId, concept, strength: newStrength }
      });
    }
  }

  const attempt = await context.entities.Attempt.create({
    data: {
      studentId: userId,
      orgStudentId: orgStudentId,
      questionSetId,
      answers: JSON.stringify(answers),
      score: isNaN(obtained) ? 0 : Math.round(obtained * 100) / 100,
      totalMarks: isNaN(totalMarks) ? 0 : totalMarks,
      weakAreas: conceptResults
    }
  });
  // Identify weak topics (accuracy < 50%)
  const weakTopics = Object.entries(conceptResults)
    .filter(([_, stats]) => (stats.correct / stats.total) < 0.5)
    .map(([concept, stats]) => ({
      concept,
      accuracy: Math.round((stats.correct / stats.total) * 100),
      correct: stats.correct,
      total: stats.total
    }));

  return JSON.parse(JSON.stringify({
    attemptId: attempt.id, score: Math.round(obtained * 100) / 100,
    totalMarks, weakTopics, conceptResults
  }));

}

// Normalize a string for comparison: lowercase, trim, strip letter prefixes, collapse whitespace
function norm(s) {
  if (typeof s !== 'string') return String(s ?? '');
  return s.replace(/^[A-Da-d][.):\s]+/, '').trim().toLowerCase().replace(/\s+/g, ' ');
}

function checkAnswer(user, correct, type) {
  if (!user && user !== 0) return false;

  if (type === 'MCQ') {
    const match = norm(user) === norm(correct);
    console.log(`[Score] MCQ: user="${user}" correct="${correct}" norm_user="${norm(user)}" norm_correct="${norm(correct)}" → ${match}`);
    return match;
  }

  if (type === 'NAT') {
    const u = parseFloat(user), c = parseFloat(correct);
    const match = !isNaN(u) && !isNaN(c) && Math.abs(u - c) < 0.01;
    console.log(`[Score] NAT: user=${u} correct=${c} → ${match}`);
    return match;
  }

  if (type === 'MSQ') {
    let correctArr = correct;
    if (typeof correct === 'string') {
      try { correctArr = JSON.parse(correct); } catch {
        correctArr = correct.split(',').map(s => s.trim()).filter(Boolean);
      }
    }
    let userArr = user;
    if (typeof user === 'string') {
      try { userArr = JSON.parse(user); } catch { userArr = [user]; }
    }
    if (!Array.isArray(userArr) || !Array.isArray(correctArr)) return false;
    const userNorm = userArr.map(norm);
    const correctNorm = correctArr.map(norm);
    const allUserCorrect = userNorm.every(u => correctNorm.includes(u));
    const coverage = userNorm.filter(u => correctNorm.includes(u)).length / correctNorm.length;
    const match = allUserCorrect && coverage >= 0.7;
    console.log(`[Score] MSQ: user=${JSON.stringify(userArr)} correct=${JSON.stringify(correctArr)} coverage=${(coverage*100).toFixed(0)}% → ${match}`);
    return match;
  }

  return false;
}

