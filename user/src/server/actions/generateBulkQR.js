import { generateSecureToken, signQRPayload, hashToken } from '../utils/crypto.js';
import { computeStudentScore, getRecommendedDifficulty } from '../utils/scoring.js';
export async function generateBulkQR(args, context) {
    if (!context.user)
        throw new Error('Not authenticated');
    const { campaignId, orgId, adaptive } = args;
    const campaign = await context.entities.Campaign.findUnique({ where: { id: campaignId } });
    if (!campaign)
        throw new Error('Campaign not found');
    const students = await context.entities.OrgStudent.findMany({ where: { orgId } });
    if (students.length === 0)
        throw new Error('No students in organization');
    // Load weight config if adaptive mode is on
    let weights;
    if (adaptive) {
        const config = await context.entities.OrgConfig.findUnique({ where: { orgId } });
        if (config) {
            weights = {
                assignment: config.weightAssignment,
                behavior: config.weightBehavior,
                performance: config.weightPerformance,
                classTest: config.weightClassTest
            };
        }
    }
    const results = [];
    for (const student of students) {
        let difficulty = null;
        // Compute adaptive difficulty per student if enabled
        if (adaptive) {
            const assessments = await context.entities.Assessment.findMany({ where: { orgStudentId: student.id } });
            const qrPapers = await context.entities.QRPaper.findMany({
                where: { orgStudentId: student.id },
                include: { questionSets: { include: { attempts: true } } }
            });
            const attempts = [];
            for (const p of qrPapers) {
                for (const qs of p.questionSets) {
                    for (const a of qs.attempts)
                        attempts.push(a);
                }
            }
            const { combinedScore } = computeStudentScore(assessments, attempts, weights);
            difficulty = getRecommendedDifficulty(combinedScore);
        }
        const rawToken = generateSecureToken();
        const tokenHash = hashToken(rawToken);
        const payload = { orgStudentId: student.id, campaignId, exp: Math.floor(Date.now() / 1000) + 86400 };
        const signature = await signQRPayload(payload);
        const qrPaper = await context.entities.QRPaper.create({
            data: { token: tokenHash, signature, orgStudentId: student.id, campaignId, isUsed: false, difficulty }
        });
        results.push({
            student: { id: student.id, name: student.name, rollNo: student.rollNo, section: student.section },
            rawToken,
            qrPaperId: qrPaper.id,
            paperUrl: '/paper/' + rawToken,
            difficulty: difficulty || campaign.difficulty
        });
    }
    return results;
}
