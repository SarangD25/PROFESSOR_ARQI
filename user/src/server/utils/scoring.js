// Scoring utility — computes combined student score from assessments + class tests
const DEFAULT_WEIGHTS = {
    assignment: 0.30,
    behavior: 0.10,
    performance: 0.20,
    classTest: 0.40
};
export function computeStudentScore(assessments, classTestAttempts, weights) {
    const w = weights || DEFAULT_WEIGHTS;
    const categories = {
        assignment: { scored: 0, total: 0 },
        behavior: { scored: 0, total: 0 },
        performance: { scored: 0, total: 0 },
        classTest: { scored: 0, total: 0 }
    };
    // Aggregate manual assessments by type
    for (const a of assessments) {
        if (categories[a.type]) {
            categories[a.type].scored += a.marks;
            categories[a.type].total += a.maxMarks;
        }
    }
    // Aggregate class test attempts
    for (const attempt of classTestAttempts) {
        categories.classTest.scored += attempt.score;
        categories.classTest.total += attempt.totalMarks;
    }
    // Build breakdown — only include categories that have data
    /** @type {Record<string, any>} */
    const breakdown = {};
    let activeWeightSum = 0;
    for (const [key, cat] of Object.entries(categories)) {
        if (cat.total > 0) {
            breakdown[key] = {
                scored: cat.scored,
                total: cat.total,
                percent: (cat.scored / cat.total) * 100,
                weight: w[key] || DEFAULT_WEIGHTS[key]
            };
            activeWeightSum += breakdown[key].weight;
        }
    }
    // Redistribute weights proportionally for missing categories
    let combinedScore = 0;
    for (const data of Object.values(breakdown)) {
        data.adjustedWeight = activeWeightSum > 0 ? data.weight / activeWeightSum : 0;
        data.weighted = data.percent * data.adjustedWeight;
        combinedScore += data.weighted;
    }
    return { breakdown, combinedScore: Math.round(combinedScore * 100) / 100 };
}
export function getTier(score) {
    if (score >= 80)
        return { name: 'Excellent', color: 'green', emoji: '🟢' };
    if (score >= 60)
        return { name: 'Good', color: 'blue', emoji: '🔵' };
    if (score >= 40)
        return { name: 'Average', color: 'yellow', emoji: '🟡' };
    return { name: 'Needs Improvement', color: 'red', emoji: '🔴' };
}
export function getRecommendedDifficulty(score) {
    if (score >= 80)
        return 'hard';
    if (score >= 50)
        return 'medium';
    return 'easy';
}
