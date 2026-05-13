import { generateSecureToken, signQRPayload, hashToken } from '../utils/crypto.js';
export async function generateSecureQR(args, context) {
    const { campaignId, studentId } = args;
    const campaign = await context.entities.Campaign.findUnique({ where: { id: campaignId } });
    if (!campaign)
        throw new Error('Campaign not found');
    const rawToken = generateSecureToken();
    const tokenHash = hashToken(rawToken);
    const payload = { studentId, campaignId, exp: Math.floor(Date.now() / 1000) + 7200 };
    const signature = await signQRPayload(payload);
    const qrPaper = await context.entities.QRPaper.create({
        data: { token: tokenHash, signature, studentId, campaignId, isUsed: false }
    });
    return { rawToken, signature, qrPaperId: qrPaper.id };
}
