import { Request, Response } from 'express';
import { SavedPlan } from '../models/SavedPlan';
import { SavedSummary } from '../models/SavedSummary';
import { SavedLearningSession } from '../models/SavedLearningSession';
import { TaskChecklistItem } from '../models/TaskChecklistItem';
import { CalendarActivity } from '../models/CalendarActivity';

const getUserId = (req: Request) => {
    const userId = (req as any).session?.userId as string;
    if (!userId) {
        console.warn('[Mongo] No userId in session!');
    }
    return userId;
};

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

// Task Checklist
export const getTasks = async (req: Request, res: Response) => {
    try {
        const userId = getUserId(req);
        const tasks = await TaskChecklistItem.find({ userId }).sort({ createdAt: -1 });
        res.json(tasks);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const addTask = async (req: Request, res: Response) => {
    try {
        const userId = getUserId(req);
        const { taskId, title, description } = req.body;

        const task = await TaskChecklistItem.create({
            userId,
            taskId,
            title,
            description,
        });

        res.json({ success: true, task });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const clearTasks = async (req: Request, res: Response) => {
    try {
        const userId = getUserId(req);
        await TaskChecklistItem.deleteMany({ userId });
        res.json({ success: true, message: 'Tasks cleared' });
        console.log(`[Mongo] Cleared tasks for user ${userId}`);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const toggleTask = async (req: Request, res: Response) => {
    try {
        const userId = getUserId(req);
        const { taskId } = req.params;
        console.log(`[Mongo] Toggling task: ${taskId} for user: ${userId}`);

        // Try searching by both _id and manual taskId just in case there's confusion
        let task = await TaskChecklistItem.findOne({ userId, _id: taskId });
        if (!task) {
            task = await TaskChecklistItem.findOne({ userId, taskId: taskId });
        }

        if (!task) {
            console.warn(`[Mongo] Task NOT found: ${taskId} for user: ${userId}`);
            return res.status(404).json({ error: 'Task not found' });
        }

        task.completed = !task.completed;
        task.completedAt = task.completed ? new Date() : undefined;
        await task.save();

        res.json({ success: true, task });
    } catch (error: any) {
        console.error('[Mongo] Toggle error:', error);
        res.status(500).json({ error: error.message });
    }
};

// Calendar Activities
export const getCalendarActivities = async (req: Request, res: Response) => {
    try {
        const userId = getUserId(req);
        const now = new Date();

        // Get activities that haven't expired yet
        const activities = await CalendarActivity.find({
            userId,
            expiresAt: { $gt: now }
        }).sort({ addedAt: -1 });

        res.json(activities);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const addCalendarActivity = async (req: Request, res: Response) => {
    try {
        const userId = getUserId(req);
        const { eventId, title, start, end } = req.body;

        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours from now

        const activity = await CalendarActivity.create({
            userId,
            eventId,
            title,
            start: new Date(start),
            end: new Date(end),
            addedToCalendar: true,
            addedAt: new Date(),
            expiresAt,
        });

        res.json({ success: true, activity });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

