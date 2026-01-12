import { Request, Response } from 'express';
import { SavedPlan } from '../models/SavedPlan';
import { SavedSummary } from '../models/SavedSummary';
import { SavedLearningSession } from '../models/SavedLearningSession';

const getUserId = (req: Request) => (req as any).session?.userId as string;

export const savePlan = async (req: Request, res: Response) => {
    try {
        const userId = getUserId(req);
        const { weekStartDate, planJson } = req.body;

        if (!weekStartDate || !planJson) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const saved = await SavedPlan.create({
            userId,
            weekStartDate: new Date(weekStartDate),
            planJson: typeof planJson === 'string' ? planJson : JSON.stringify(planJson)
        });

        res.json({ success: true, id: saved._id });
        console.log(`[Mongo] Saved plan for user ${userId}`);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const saveSummary = async (req: Request, res: Response) => {
    try {
        const userId = getUserId(req);
        const { sourceFile, summaryText } = req.body;

        if (!sourceFile || !summaryText) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const saved = await SavedSummary.create({
            userId,
            sourceFile,
            summaryText
        });

        res.json({ success: true, id: saved._id });
        console.log(`[Mongo] Saved summary for user ${userId}`);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const saveLearningSession = async (req: Request, res: Response) => {
    try {
        const userId = getUserId(req);
        const { filename, summary, graph, quiz } = req.body;

        const session = await SavedLearningSession.create({
            userId,
            filename,
            summary,
            graph,
            quiz,
        });

        res.json({ success: true, id: session._id });
        console.log(`[Mongo] Saved learning session for user ${userId}`);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getLearningSessions = async (req: Request, res: Response) => {
    try {
        const userId = getUserId(req);
        const sessions = await SavedLearningSession.find({ userId }).sort({ savedAt: -1 });
        res.json(sessions);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getSavedPlans = async (req: Request, res: Response) => {
    try {
        const userId = getUserId(req);
        const plans = await SavedPlan.find({ userId }).sort({ createdAt: -1 });
        res.json(plans);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
