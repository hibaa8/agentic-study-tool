"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSavedPlans = exports.getLearningSessions = exports.saveLearningSession = exports.saveSummary = exports.savePlan = void 0;
const SavedPlan_1 = require("../models/SavedPlan");
const SavedSummary_1 = require("../models/SavedSummary");
const SavedLearningSession_1 = require("../models/SavedLearningSession");
const getUserId = (req) => req.session?.userId;
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
