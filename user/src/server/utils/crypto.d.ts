export function signQRPayload(payload: any): Promise<string>;
export function verifyQRSignature(token: any): Promise<jose.JWTPayload | null>;
export function hashToken(rawToken: any): string;
export function generateSecureToken(): string;
import * as jose from 'jose';
