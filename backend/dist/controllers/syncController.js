"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncAll = exports.syncDocs = exports.syncCalendar = exports.syncGmail = void 0;
const syncService = __importStar(require("../services/syncService"));
const shared_1 = require("@focus/shared");
// Helper to get userId from request (asserting it exists due to middleware)
const getUserId = (req) => req.userId;
const syncGmail = async (req, res) => {
    try {
        const userId = getUserId(req);
        const limit = Number(req.query.limit) || 10;
        const result = await syncService.syncGmail(userId, limit);
        res.json({ success: true, count: result.length, data: result });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.syncGmail = syncGmail;
const syncCalendar = async (req, res) => {
    try {
        const userId = getUserId(req);
        const days = Number(req.query.days) || 7;
        const result = await syncService.syncCalendar(userId, days);
        res.json({ success: true, count: result.length, data: result });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.syncCalendar = syncCalendar;
const syncDocs = async (req, res) => {
    try {
        const userId = getUserId(req);
        // Validate body
        const body = shared_1.SyncOptionsSchema.parse(req.body);
        const result = await syncService.syncDocs(userId, body);
        res.json({ success: true, count: result.length, data: result });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.syncDocs = syncDocs;
const syncAll = async (req, res) => {
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
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.syncAll = syncAll;
