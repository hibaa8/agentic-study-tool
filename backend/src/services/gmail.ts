import { google } from 'googleapis';
import { getGoogleClient } from './googleAuth';

/**
 * Sends an email using the Gmail API.
 */
export const sendEmail = async (userId: string, to: string, subject: string, body: string) => {
    try {
        const auth = await getGoogleClient(userId);
        const gmail = google.gmail({ version: 'v1', auth });

        // Construct raw email (RFC 2822 format)
        // Headers + Body, then base64url encoded
        const str = [
            `To: ${to}`,
            `Subject: ${subject}`,
            `Content-Type: text/plain; charset="UTF-8"`,
            `MIME-Version: 1.0`,
            ``,
            body
        ].join('\n');

        const encodedMail = Buffer.from(str)
            .toString('base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');

        const response = await gmail.users.messages.send({
            userId: 'me',
            requestBody: {
                raw: encodedMail
            }
        });

        console.log(`[Gmail] Sent email to ${to} (ID: ${response.data.id})`);
        return response.data;

    } catch (error: any) {
        console.error('[Gmail] Send error:', error);
        throw new Error(`Failed to send email: ${error.message}`);
    }
};
