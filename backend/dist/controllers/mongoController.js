"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addCalendarActivity = exports.getCalendarActivities = exports.toggleTask = exports.clearTasks = exports.addTask = exports.getTasks = exports.getSavedPlans = exports.getLearningSessions = exports.saveLearningSession = exports.saveSummary = exports.savePlan = void 0;
const SavedPlan_1 = require("../models/SavedPlan");
const SavedSummary_1 = require("../models/SavedSummary");
const SavedLearningSession_1 = require("../models/SavedLearningSession");
const TaskChecklistItem_1 = require("../models/TaskChecklistItem");
const CalendarActivity_1 = require("../models/CalendarActivity");
const getUserId = (req) => {
    const userId = req.session?.userId;
    if (!userId) {
        console.warn('[Mongo] No userId in session!');
    }
    return userId;
};
const savePlan = async (req, res) => {
    try {
        const userId = getUserId(req);
        const { weekStartDate, planJson } = req.body;
        if (!weekStartDate || !planJson) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        const saved = await SavedPlan_1.SavedPlan.create({
            userId,
            weekStartDate: new Date(weekStartDate),
            planJson: typeof planJson === 'string' ? planJson : JSON.stringify(planJson)
        });
        res.json({ success: true, id: saved._id });
        console.log(`[Mongo] Saved plan for user ${userId}`);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.savePlan = savePlan;
const saveSummary = async (req, res) => {
    try {
        const userId = getUserId(req);
        const { sourceFile, summaryText } = req.body;
        if (!sourceFile || !summaryText) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        const saved = await SavedSummary_1.SavedSummary.create({
            userId,
            sourceFile,
            summaryText
        });
        res.json({ success: true, id: saved._id });
        console.log(`[Mongo] Saved summary for user ${userId}`);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.saveSummary = saveSummary;
const saveLearningSession = async (req, res) => {
    try {
        const userId = getUserId(req);
        const { filename, summary, graph, quiz } = req.body;
        const session = await SavedLearningSession_1.SavedLearningSession.create({
            userId,
            filename,
            summary,
            graph,
            quiz,
        });
        res.json({ success: true, id: session._id });
        console.log(`[Mongo] Saved learning session for user ${userId}`);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.saveLearningSession = saveLearningSession;
const getLearningSessions = async (req, res) => {
    try {
        const userId = getUserId(req);
        const sessions = await SavedLearningSession_1.SavedLearningSession.find({ userId }).sort({ savedAt: -1 });
        res.json(sessions);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getLearningSessions = getLearningSessions;
const getSavedPlans = async (req, res) => {
    try {
        const userId = getUserId(req);
        const plans = await SavedPlan_1.SavedPlan.find({ userId }).sort({ createdAt: -1 });
        res.json(plans);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getSavedPlans = getSavedPlans;
// Task Checklist
const getTasks = async (req, res) => {
    try {
        const userId = getUserId(req);
        const tasks = await TaskChecklistItem_1.TaskChecklistItem.find({ userId }).sort({ createdAt: -1 });
        res.json(tasks);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getTasks = getTasks;
const addTask = async (req, res) => {
    try {
        const userId = getUserId(req);
        const { taskId, title, description } = req.body;
        const task = await TaskChecklistItem_1.TaskChecklistItem.create({
            userId,
            taskId,
            title,
            description,
        });
        res.json({ success: true, task });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.addTask = addTask;
const clearTasks = async (req, res) => {
    try {
        const userId = getUserId(req);
        await TaskChecklistItem_1.TaskChecklistItem.deleteMany({ userId });
        res.json({ success: true, message: 'Tasks cleared' });
        console.log(`[Mongo] Cleared tasks for user ${userId}`);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.clearTasks = clearTasks;
const toggleTask = async (req, res) => {
    try {
        const userId = getUserId(req);
        const { taskId } = req.params;
        console.log(`[Mongo] Toggling task: ${taskId} for user: ${userId}`);
        // Try searching by both _id and manual taskId just in case there's confusion
        let task = await TaskChecklistItem_1.TaskChecklistItem.findOne({ userId, _id: taskId });
        if (!task) {
            task = await TaskChecklistItem_1.TaskChecklistItem.findOne({ userId, taskId: taskId });
        }
        if (!task) {
            console.warn(`[Mongo] Task NOT found: ${taskId} for user: ${userId}`);
            return res.status(404).json({ error: 'Task not found' });
        }
        task.completed = !task.completed;
        task.completedAt = task.completed ? new Date() : undefined;
        await task.save();
        res.json({ success: true, task });
    }
    catch (error) {
        console.error('[Mongo] Toggle error:', error);
        res.status(500).json({ error: error.message });
    }
};
exports.toggleTask = toggleTask;
// Calendar Activities
const getCalendarActivities = async (req, res) => {
    try {
        const userId = getUserId(req);
        const now = new Date();
        // Get activities that haven't expired yet
        const activities = await CalendarActivity_1.CalendarActivity.find({
            userId,
            expiresAt: { $gt: now }
        }).sort({ addedAt: -1 });
        res.json(activities);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getCalendarActivities = getCalendarActivities;
const addCalendarActivity = async (req, res) => {
    try {
        const userId = getUserId(req);
        const { eventId, title, start, end } = req.body;
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours from now
        const activity = await CalendarActivity_1.CalendarActivity.create({
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
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.addCalendarActivity = addCalendarActivity;
