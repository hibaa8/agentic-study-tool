import { Request, Response, NextFunction } from 'express';

// For this scaffold, we will use a simple session-like mechanism or just assume single user for dev.
// But requirements say "User (id, email...)".
// We will implement a simple cookie-based session or just store userId in a signed cookie.
// Since we don't have a full auth setup (password login), we rely on Google OAuth.
// We will store the userId in the session.

export interface AuthRequest extends Request {
    userId?: string;
}

export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
    // Check for userId in session (using express-session default or similar)
    // For simplicity in this scaffold without setting up redis/store, we'll check req.session
    // We assume express-session is configured in index.ts

    // @ts-ignore
    if (req.session && req.session.userId) {
        // @ts-ignore
        req.userId = req.session.userId;
        next();
    } else {
        res.status(401).json({ error: 'Unauthorized' });
    }
};
