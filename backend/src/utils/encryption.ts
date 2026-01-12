import crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';
const KEY_STRING = process.env.TOKEN_ENCRYPTION_KEY || '12345678901234567890123456789012';
const KEY = Buffer.from(KEY_STRING.substring(0, 32)); // Ensure 32 bytes

export const encryptToken = (text: string): string => {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return `${iv.toString('hex')}:${encrypted}`;
};

export const decryptToken = (text: string): string => {
    const parts = text.split(':');
    if (parts.length !== 2) throw new Error('Invalid encrypted text format');

    const iv = Buffer.from(parts[0], 'hex');
    const encryptedText = parts[1];
    const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);

    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
};
