import { google } from 'googleapis';
import { prisma } from '../utils/db';
import { encryptToken, decryptToken } from '../utils/encryption';

const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URL
);

// Debug logging
console.log('Google Auth Config:', {
    clientId: process.env.GOOGLE_CLIENT_ID ? 'Set' : 'Missing',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET ? 'Set' : 'Missing',
    redirectUrl: process.env.GOOGLE_REDIRECT_URL,
});

const SCOPES = [
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/gmail.send',  // Added for sending emails
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/drive.readonly'
];

export const getAuthUrl = () => {
    return oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
        prompt: 'consent', // Force refresh token
        redirect_uri: process.env.GOOGLE_REDIRECT_URL // Explicitly pass it
    });
};

export const handleAuthCallback = async (code: string) => {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const { data: userInfo } = await oauth2.userinfo.get();

    if (!userInfo.email || !userInfo.id) {
        throw new Error('Failed to get user info from Google');
    }

    // Find or create User
    let user = await prisma.user.findUnique({
        where: { email: userInfo.email }
    });

    if (!user) {
        user = await prisma.user.create({
            data: {
                email: userInfo.email,
                name: userInfo.name || 'User',
            }
        });
    }

    // Encrypt tokens
    const accessTokenEnc = encryptToken(tokens.access_token!);
    const refreshTokenEnc = tokens.refresh_token ? encryptToken(tokens.refresh_token) : '';

    // Upsert GoogleAccount
    await prisma.googleAccount.upsert({
        where: { userId: user.id },
        update: {
            googleSub: userInfo.id,
            accessTokenEnc,
            ...(tokens.refresh_token && { refreshTokenEnc }), // Only update if new refresh token exists
            expiryDate: tokens.expiry_date ? BigInt(tokens.expiry_date) : null,
            updatedAt: new Date()
        },
        create: {
            userId: user.id,
            googleSub: userInfo.id,
            accessTokenEnc,
            refreshTokenEnc: refreshTokenEnc || '', // Should ideally handle missing refresh token case
            expiryDate: tokens.expiry_date ? BigInt(tokens.expiry_date) : null,
            scopes: JSON.stringify(SCOPES)
        }
    });

    return user;
};

export const getGoogleClient = async (userId: string) => {
    console.log("getGoogleClient userId:", userId, typeof userId);
    if (!userId) {
        throw new Error("getGoogleClient called without userId - user may not be authenticated");
    }

    const account = await prisma.googleAccount.findUnique({ where: { userId } });
    if (!account) throw new Error('User has no connected Google account');

    const client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URL
    );

    const refreshToken = account.refreshTokenEnc ? decryptToken(account.refreshTokenEnc) : null;
    const accessToken = decryptToken(account.accessTokenEnc);

    client.setCredentials({
        access_token: accessToken,
        refresh_token: refreshToken,
        expiry_date: Number(account.expiryDate)
    });

    // Auto refresh logic is handled by googleapis if refresh_token is present
    // But we might want to listen to 'tokens' event to save new tokens, 
    // though simple usage usually suffices for short-lived instances.
    // For production, we should attach an event listener to update DB on refresh.

    client.on('tokens', async (tokens) => {
        if (tokens.access_token) {
            const atEnc = encryptToken(tokens.access_token);
            const updateData: any = { accessTokenEnc: atEnc, updatedAt: new Date() };
            if (tokens.expiry_date) updateData.expiryDate = BigInt(tokens.expiry_date);
            if (tokens.refresh_token) updateData.refreshTokenEnc = encryptToken(tokens.refresh_token);

            await prisma.googleAccount.update({
                where: { userId },
                data: updateData
            });
            console.log(`Tokens refreshed for user ${userId}`);
        }
    });

    return client;
};
