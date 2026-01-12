"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = void 0;
const requireAuth = (req, res, next) => {
    // Check for userId in session (using express-session default or similar)
    // For simplicity in this scaffold without setting up redis/store, we'll check req.session
    // We assume express-session is configured in index.ts
    // @ts-ignore
    if (req.session && req.session.userId) {
        // @ts-ignore
        req.userId = req.session.userId;
        next();
    }
    else {
        res.status(401).json({ error: 'Unauthorized' });
    }
};
exports.requireAuth = requireAuth;
