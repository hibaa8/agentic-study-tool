import { Request, Response } from 'express';
import * as agentOrchestrator from '../agent/orchestrator';

const getUserId = (req: Request) => (req as any).userId as string;

export const generateWeeklyPlan = async (req: Request, res: Response) => {
    try {
        const userId = getUserId(req);
        const { weekStartDate } = req.body; // TODO: Validate format
        const plan = await agentOrchestrator.generateWeeklyPlan(userId, weekStartDate || new Date().toISOString());
        res.json(plan);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const triageInbox = async (req: Request, res: Response) => {
    try {
        const userId = getUserId(req);
        const { limit } = req.body;
        const results = await agentOrchestrator.triageInbox(userId, limit);
        res.json(results);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
