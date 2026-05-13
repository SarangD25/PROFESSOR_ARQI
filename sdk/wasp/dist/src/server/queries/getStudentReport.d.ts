export function getStudentReport(args: any, context: any): Promise<{
    student: any;
    breakdown: Record<string, any>;
    combinedScore: number;
    tier: {
        name: string;
        color: string;
        emoji: string;
    };
    recommendedDifficulty: string;
    assessments: any;
    classTests: any;
} | null>;
//# sourceMappingURL=getStudentReport.d.ts.map