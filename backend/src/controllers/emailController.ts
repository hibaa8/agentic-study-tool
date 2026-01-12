import { Request, Response } from 'express';
import { sendEmail } from '../services/gmail';

const getUserId = (req: Request) => (req as any).session?.userId as string;

export const sendReply = async (req: Request, res: Response) => {
    try {
        const userId = getUserId(req);
        const { to, subject, body } = req.body;

        if (!to || !subject || !body) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const result = await sendEmail(userId, to, subject, body);

        res.json({ success: true, messageId: result.id });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
