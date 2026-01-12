"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = void 0;
const googleapis_1 = require("googleapis");
const googleAuth_1 = require("./googleAuth");
/**
 * Sends an email using the Gmail API.
 */
const sendEmail = async (userId, to, subject, body) => {
    try {
        const auth = await (0, googleAuth_1.getGoogleClient)(userId);
        const gmail = googleapis_1.google.gmail({ version: 'v1', auth });
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
    }
    catch (error) {
        console.error('[Gmail] Send error:', error);
        throw new Error(`Failed to send email: ${error.message}`);
    }
};
exports.sendEmail = sendEmail;
