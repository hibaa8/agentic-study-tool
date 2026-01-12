import { Request, Response } from 'express';
import * as syncService from '../services/syncService';
import { SyncOptionsSchema } from '@focus/shared';

// Helper to get userId from request (asserting it exists due to middleware)
const getUserId = (req: Request) => (req as any).userId as string;

export const syncGmail = async (req: Request, res: Response) => {
    try {
        const userId = getUserId(req);
        const limit = Number(req.query.limit) || 10;
        const result = await syncService.syncGmail(userId, limit);
        res.json({ success: true, count: result.length, data: result });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const syncCalendar = async (req: Request, res: Response) => {
    try {
        const userId = getUserId(req);
        const days = Number(req.query.days) || 7;
        const result = await syncService.syncCalendar(userId, days);
        res.json({ success: true, count: result.length, data: result });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const syncDocs = async (req: Request, res: Response) => {
    try {
        const userId = getUserId(req);
        // Validate body
        const body = SyncOptionsSchema.parse(req.body);
        const result = await syncService.syncDocs(userId, body);
        res.json({ success: true, count: result.length, data: result });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const syncAll = async (req: Request, res: Response) => {
    try {
        const userId = getUserId(req);
        const [gmail, calendar] = await Promise.all([
            syncService.syncGmail(userId),
            syncService.syncCalendar(userId)
            // Docs usually require specific IDs, skipping auto-sync for now or could sync a default folder
        ]);
        res.json({
            success: true,
            gmail: gmail.length,
            calendar: calendar.length
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
