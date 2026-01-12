import { Request, Response } from 'express';
import { getAuthUrl, handleAuthCallback } from '../services/googleAuth';
import { prisma } from '../utils/db';

export const login = (req: Request, res: Response) => {
    const url = getAuthUrl();
    res.redirect(url);
};

export const callback = async (req: Request, res: Response) => {
    try {
        const code = req.query.code as string;
        const user = await handleAuthCallback(code);

        // Set session
        // @ts-ignore
        req.session.userId = user.id;

        // Redirect to frontend dashboard
        res.redirect(`${process.env.APP_BASE_URL}/`);
    } catch (error) {
        console.error('Auth callback error:', error);
        res.redirect(`${process.env.APP_BASE_URL}/login?error=auth_failed`);
    }
};

export const logout = (req: Request, res: Response) => {
    // @ts-ignore
    req.session.destroy();
    res.json({ message: 'Logged out' });
};

export const getMe = async (req: Request, res: Response) => {
    // @ts-ignore
    const userId = req.session.userId;
    if (!userId) return res.status(401).json({ error: 'Not authenticated' });

    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { googleAccount: { select: { id: true, createdAt: true } } } // Don't return tokens
    });

    if (!user) return res.status(404).json({ error: 'User not found' });

    const isConnected = !!await prisma.googleAccount.findUnique({ where: { userId } });

    res.json({
        user: { ...user, googleAccount: undefined }, // sanitize
        isConnected
    });
};

// DEV ONLY: Bypass auth
export const devLogin = async (req: Request, res: Response) => {
    try {
        const email = "hibaaltaf98@gmail.com";
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            return res.status(404).json({ error: "Dev user not found. Please login normally once to create account." });
        }

        // @ts-ignore
        req.session.userId = user.id;

        // Redirect to frontend
        res.redirect(`${process.env.APP_BASE_URL}`);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
