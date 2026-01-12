import { z } from 'zod';

export const UserSchema = z.object({
    id: z.string(),
    email: z.string().email(),
    name: z.string().optional(),
});

export const SyncOptionsSchema = z.object({
    limit: z.number().optional(),
    days: z.number().optional(),
    docId: z.string().optional(),
    folderId: z.string().optional(),
});

export const TaskSchema = z.object({
    id: z.string().optional(),
    title: z.string(),
    description: z.string().optional(),
    sourceType: z.enum(['email', 'doc', 'manual']),
    sourceId: z.string().optional(),
    dueAt: z.string().optional(), // ISO date string
    estMins: z.number().optional(),
    priority: z.enum(['high', 'medium', 'low']),
    status: z.enum(['todo', 'in_progress', 'done']),
});

export const WeeklyPlanSchema = z.object({
    weekStartDate: z.string(),
    tasks: z.array(TaskSchema),
    studyBlocks: z.array(z.object({
        title: z.string(),
        start: z.string(),
        end: z.string(),
        description: z.string().optional(),
    })),
});

export const TriageActionSchema = z.enum(['ACTION', 'WAITING', 'FYI']);

export const TriageResultSchema = z.object({
    id: z.string(), // Email ID
    subject: z.string(),
    from: z.string(),
    classification: TriageActionSchema,
    extractedTasks: z.array(TaskSchema).optional(),
    draftReply: z.string().optional(),
});

export const CalendarActionSchema = z.object({
    confirmed: z.boolean(),
    blocks: z.array(z.object({
        title: z.string(),
        start: z.string(),
        end: z.string(),
        description: z.string().optional(),
    })).optional(),
    updates: z.record(z.any()).optional(),
});

export const LearningMaterialSchema = z.object({
    id: z.string(),
    filename: z.string(),
    fileType: z.string(),
    createdAt: z.date().or(z.string()),
    summary: z.any().optional(),   // JSON placeholder
    graph: z.any().optional(),     // JSON placeholder
    mcq: z.any().optional()        // JSON placeholder
});
