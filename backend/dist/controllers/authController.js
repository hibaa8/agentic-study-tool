"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.devLogin = exports.getMe = exports.logout = exports.callback = exports.login = void 0;
const googleAuth_1 = require("../services/googleAuth");
const db_1 = require("../utils/db");
const login = (req, res) => {
    const url = (0, googleAuth_1.getAuthUrl)();
    res.redirect(url);
};
exports.login = login;
const callback = async (req, res) => {
    try {
        const code = req.query.code;
        const user = await (0, googleAuth_1.handleAuthCallback)(code);
        // Set session
        // @ts-ignore
        req.session.userId = user.id;
        // Redirect to frontend dashboard
        res.redirect(`${process.env.APP_BASE_URL}/`);
    }
    catch (error) {
        console.error('Auth callback error:', error);
        res.redirect(`${process.env.APP_BASE_URL}/login?error=auth_failed`);
    }
};
exports.callback = callback;
const logout = (req, res) => {
    // @ts-ignore
    req.session.destroy();
    res.json({ message: 'Logged out' });
};
exports.logout = logout;
const getMe = async (req, res) => {
    // @ts-ignore
    const userId = req.session.userId;
    if (!userId)
        return res.status(401).json({ error: 'Not authenticated' });
    const user = await db_1.prisma.user.findUnique({
        where: { id: userId },
        include: { googleAccount: { select: { id: true, createdAt: true } } } // Don't return tokens
    });
    if (!user)
        return res.status(404).json({ error: 'User not found' });
    const isConnected = !!await db_1.prisma.googleAccount.findUnique({ where: { userId } });
    res.json({
        user: { ...user, googleAccount: undefined }, // sanitize
        isConnected
    });
};
exports.getMe = getMe;
// DEV ONLY: Bypass auth
const devLogin = async (req, res) => {
    try {
        const email = "hibaaltaf98@gmail.com";
        const user = await db_1.prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(404).json({ error: "Dev user not found. Please login normally once to create account." });
        }
        // @ts-ignore
        req.session.userId = user.id;
        // Redirect to frontend
        res.redirect(`${process.env.APP_BASE_URL}`);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.devLogin = devLogin;
