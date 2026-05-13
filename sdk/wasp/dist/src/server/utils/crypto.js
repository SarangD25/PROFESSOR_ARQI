import crypto from 'crypto';
import * as jose from 'jose';
function decodeKey(b64url) {
    const b64 = b64url.replace(/-/g, '+').replace(/_/g, '/');
    const padded = b64 + '='.repeat((4 - b64.length % 4) % 4);
    return Buffer.from(padded, 'base64').toString('utf-8');
}
const PRIVATE_KEY = decodeKey(process.env.QR_SIGNING_PRIVATE_KEY);
const PUBLIC_KEY = decodeKey(process.env.QR_SIGNING_PUBLIC_KEY);
export async function signQRPayload(payload) {
    const jwt = await new jose.SignJWT(payload)
        .setProtectedHeader({ alg: 'ES256' })
        .setIssuedAt()
        .setExpirationTime('2h')
        .sign(await jose.importPKCS8(PRIVATE_KEY, 'ES256'));
    return jwt;
}
export async function verifyQRSignature(token) {
    try {
        const { payload } = await jose.jwtVerify(token, await jose.importSPKI(PUBLIC_KEY, 'ES256'));
        return payload;
    }
    catch (err) {
        return null;
    }
}
export function hashToken(rawToken) {
    return crypto.createHash('sha256').update(rawToken).digest('hex');
}
export function generateSecureToken() {
    return crypto.randomBytes(32).toString('hex');
}
//# sourceMappingURL=crypto.js.map