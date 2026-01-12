"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendReply = void 0;
const gmail_1 = require("../services/gmail");
const getUserId = (req) => req.session?.userId;
const sendReply = async (req, res) => {
    try {
        const userId = getUserId(req);
        const { to, subject, body } = req.body;
        if (!to || !subject || !body) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        const result = await (0, gmail_1.sendEmail)(userId, to, subject, body);
        res.json({ success: true, messageId: result.id });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.sendReply = sendReply;
