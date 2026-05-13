export function computeStudentScore(assessments: any, classTestAttempts: any, weights: any): {
    breakdown: Record<string, any>;
    combinedScore: number;
};
export function getTier(score: any): {
    name: string;
    color: string;
    emoji: string;
};
export function getRecommendedDifficulty(score: any): "hard" | "medium" | "easy";
//# sourceMappingURL=scoring.d.ts.map