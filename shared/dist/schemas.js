"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LearningMaterialSchema = exports.CalendarActionSchema = exports.TriageResultSchema = exports.TriageActionSchema = exports.WeeklyPlanSchema = exports.TaskSchema = exports.SyncOptionsSchema = exports.UserSchema = void 0;
const zod_1 = require("zod");
exports.UserSchema = zod_1.z.object({
    id: zod_1.z.string(),
    email: zod_1.z.string().email(),
    name: zod_1.z.string().optional(),
});
exports.SyncOptionsSchema = zod_1.z.object({
    limit: zod_1.z.number().optional(),
    days: zod_1.z.number().optional(),
    docId: zod_1.z.string().optional(),
    folderId: zod_1.z.string().optional(),
});
exports.TaskSchema = zod_1.z.object({
    id: zod_1.z.string().optional(),
    title: zod_1.z.string(),
    description: zod_1.z.string().optional(),
    sourceType: zod_1.z.enum(['email', 'doc', 'manual']),
    sourceId: zod_1.z.string().optional(),
    dueAt: zod_1.z.string().optional(), // ISO date string
    estMins: zod_1.z.number().optional(),
    priority: zod_1.z.enum(['high', 'medium', 'low']),
    status: zod_1.z.enum(['todo', 'in_progress', 'done']),
});
exports.WeeklyPlanSchema = zod_1.z.object({
    weekStartDate: zod_1.z.string(),
    tasks: zod_1.z.array(exports.TaskSchema),
    studyBlocks: zod_1.z.array(zod_1.z.object({
        title: zod_1.z.string(),
        start: zod_1.z.string(),
        end: zod_1.z.string(),
        description: zod_1.z.string().optional(),
    })),
});
exports.TriageActionSchema = zod_1.z.enum(['ACTION', 'WAITING', 'FYI']);
exports.TriageResultSchema = zod_1.z.object({
    id: zod_1.z.string(), // Email ID
    subject: zod_1.z.string(),
    from: zod_1.z.string(),
    classification: exports.TriageActionSchema,
    extractedTasks: zod_1.z.array(exports.TaskSchema).optional(),
    draftReply: zod_1.z.string().optional(),
});
exports.CalendarActionSchema = zod_1.z.object({
    confirmed: zod_1.z.boolean(),
    blocks: zod_1.z.array(zod_1.z.object({
        title: zod_1.z.string(),
        start: zod_1.z.string(),
        end: zod_1.z.string(),
        description: zod_1.z.string().optional(),
    })).optional(),
    updates: zod_1.z.record(zod_1.z.any()).optional(),
});
exports.LearningMaterialSchema = zod_1.z.object({
    id: zod_1.z.string(),
    filename: zod_1.z.string(),
    fileType: zod_1.z.string(),
    createdAt: zod_1.z.date().or(zod_1.z.string()),
    summary: zod_1.z.any().optional(), // JSON placeholder
    graph: zod_1.z.any().optional(), // JSON placeholder
    mcq: zod_1.z.any().optional() // JSON placeholder
});
