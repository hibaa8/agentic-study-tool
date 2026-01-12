import { z } from 'zod';
export declare const UserSchema: z.ZodObject<{
    id: z.ZodString;
    email: z.ZodString;
    name: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    id: string;
    email: string;
    name?: string | undefined;
}, {
    id: string;
    email: string;
    name?: string | undefined;
}>;
export declare const SyncOptionsSchema: z.ZodObject<{
    limit: z.ZodOptional<z.ZodNumber>;
    days: z.ZodOptional<z.ZodNumber>;
    docId: z.ZodOptional<z.ZodString>;
    folderId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    limit?: number | undefined;
    days?: number | undefined;
    docId?: string | undefined;
    folderId?: string | undefined;
}, {
    limit?: number | undefined;
    days?: number | undefined;
    docId?: string | undefined;
    folderId?: string | undefined;
}>;
export declare const TaskSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    sourceType: z.ZodEnum<["email", "doc", "manual"]>;
    sourceId: z.ZodOptional<z.ZodString>;
    dueAt: z.ZodOptional<z.ZodString>;
    estMins: z.ZodOptional<z.ZodNumber>;
    priority: z.ZodEnum<["high", "medium", "low"]>;
    status: z.ZodEnum<["todo", "in_progress", "done"]>;
}, "strip", z.ZodTypeAny, {
    status: "todo" | "in_progress" | "done";
    title: string;
    sourceType: "email" | "doc" | "manual";
    priority: "high" | "medium" | "low";
    id?: string | undefined;
    description?: string | undefined;
    sourceId?: string | undefined;
    dueAt?: string | undefined;
    estMins?: number | undefined;
}, {
    status: "todo" | "in_progress" | "done";
    title: string;
    sourceType: "email" | "doc" | "manual";
    priority: "high" | "medium" | "low";
    id?: string | undefined;
    description?: string | undefined;
    sourceId?: string | undefined;
    dueAt?: string | undefined;
    estMins?: number | undefined;
}>;
export declare const WeeklyPlanSchema: z.ZodObject<{
    weekStartDate: z.ZodString;
    tasks: z.ZodArray<z.ZodObject<{
        id: z.ZodOptional<z.ZodString>;
        title: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        sourceType: z.ZodEnum<["email", "doc", "manual"]>;
        sourceId: z.ZodOptional<z.ZodString>;
        dueAt: z.ZodOptional<z.ZodString>;
        estMins: z.ZodOptional<z.ZodNumber>;
        priority: z.ZodEnum<["high", "medium", "low"]>;
        status: z.ZodEnum<["todo", "in_progress", "done"]>;
    }, "strip", z.ZodTypeAny, {
        status: "todo" | "in_progress" | "done";
        title: string;
        sourceType: "email" | "doc" | "manual";
        priority: "high" | "medium" | "low";
        id?: string | undefined;
        description?: string | undefined;
        sourceId?: string | undefined;
        dueAt?: string | undefined;
        estMins?: number | undefined;
    }, {
        status: "todo" | "in_progress" | "done";
        title: string;
        sourceType: "email" | "doc" | "manual";
        priority: "high" | "medium" | "low";
        id?: string | undefined;
        description?: string | undefined;
        sourceId?: string | undefined;
        dueAt?: string | undefined;
        estMins?: number | undefined;
    }>, "many">;
    studyBlocks: z.ZodArray<z.ZodObject<{
        title: z.ZodString;
        start: z.ZodString;
        end: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        title: string;
        start: string;
        end: string;
        description?: string | undefined;
    }, {
        title: string;
        start: string;
        end: string;
        description?: string | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    weekStartDate: string;
    tasks: {
        status: "todo" | "in_progress" | "done";
        title: string;
        sourceType: "email" | "doc" | "manual";
        priority: "high" | "medium" | "low";
        id?: string | undefined;
        description?: string | undefined;
        sourceId?: string | undefined;
        dueAt?: string | undefined;
        estMins?: number | undefined;
    }[];
    studyBlocks: {
        title: string;
        start: string;
        end: string;
        description?: string | undefined;
    }[];
}, {
    weekStartDate: string;
    tasks: {
        status: "todo" | "in_progress" | "done";
        title: string;
        sourceType: "email" | "doc" | "manual";
        priority: "high" | "medium" | "low";
        id?: string | undefined;
        description?: string | undefined;
        sourceId?: string | undefined;
        dueAt?: string | undefined;
        estMins?: number | undefined;
    }[];
    studyBlocks: {
        title: string;
        start: string;
        end: string;
        description?: string | undefined;
    }[];
}>;
export declare const TriageActionSchema: z.ZodEnum<["ACTION", "WAITING", "FYI"]>;
export declare const TriageResultSchema: z.ZodObject<{
    id: z.ZodString;
    subject: z.ZodString;
    from: z.ZodString;
    classification: z.ZodEnum<["ACTION", "WAITING", "FYI"]>;
    extractedTasks: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodOptional<z.ZodString>;
        title: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        sourceType: z.ZodEnum<["email", "doc", "manual"]>;
        sourceId: z.ZodOptional<z.ZodString>;
        dueAt: z.ZodOptional<z.ZodString>;
        estMins: z.ZodOptional<z.ZodNumber>;
        priority: z.ZodEnum<["high", "medium", "low"]>;
        status: z.ZodEnum<["todo", "in_progress", "done"]>;
    }, "strip", z.ZodTypeAny, {
        status: "todo" | "in_progress" | "done";
        title: string;
        sourceType: "email" | "doc" | "manual";
        priority: "high" | "medium" | "low";
        id?: string | undefined;
        description?: string | undefined;
        sourceId?: string | undefined;
        dueAt?: string | undefined;
        estMins?: number | undefined;
    }, {
        status: "todo" | "in_progress" | "done";
        title: string;
        sourceType: "email" | "doc" | "manual";
        priority: "high" | "medium" | "low";
        id?: string | undefined;
        description?: string | undefined;
        sourceId?: string | undefined;
        dueAt?: string | undefined;
        estMins?: number | undefined;
    }>, "many">>;
    draftReply: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    id: string;
    subject: string;
    from: string;
    classification: "ACTION" | "WAITING" | "FYI";
    extractedTasks?: {
        status: "todo" | "in_progress" | "done";
        title: string;
        sourceType: "email" | "doc" | "manual";
        priority: "high" | "medium" | "low";
        id?: string | undefined;
        description?: string | undefined;
        sourceId?: string | undefined;
        dueAt?: string | undefined;
        estMins?: number | undefined;
    }[] | undefined;
    draftReply?: string | undefined;
}, {
    id: string;
    subject: string;
    from: string;
    classification: "ACTION" | "WAITING" | "FYI";
    extractedTasks?: {
        status: "todo" | "in_progress" | "done";
        title: string;
        sourceType: "email" | "doc" | "manual";
        priority: "high" | "medium" | "low";
        id?: string | undefined;
        description?: string | undefined;
        sourceId?: string | undefined;
        dueAt?: string | undefined;
        estMins?: number | undefined;
    }[] | undefined;
    draftReply?: string | undefined;
}>;
export declare const CalendarActionSchema: z.ZodObject<{
    confirmed: z.ZodBoolean;
    blocks: z.ZodOptional<z.ZodArray<z.ZodObject<{
        title: z.ZodString;
        start: z.ZodString;
        end: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        title: string;
        start: string;
        end: string;
        description?: string | undefined;
    }, {
        title: string;
        start: string;
        end: string;
        description?: string | undefined;
    }>, "many">>;
    updates: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    confirmed: boolean;
    blocks?: {
        title: string;
        start: string;
        end: string;
        description?: string | undefined;
    }[] | undefined;
    updates?: Record<string, any> | undefined;
}, {
    confirmed: boolean;
    blocks?: {
        title: string;
        start: string;
        end: string;
        description?: string | undefined;
    }[] | undefined;
    updates?: Record<string, any> | undefined;
}>;
export declare const LearningMaterialSchema: z.ZodObject<{
    id: z.ZodString;
    filename: z.ZodString;
    fileType: z.ZodString;
    createdAt: z.ZodUnion<[z.ZodDate, z.ZodString]>;
    summary: z.ZodOptional<z.ZodAny>;
    graph: z.ZodOptional<z.ZodAny>;
    mcq: z.ZodOptional<z.ZodAny>;
}, "strip", z.ZodTypeAny, {
    id: string;
    filename: string;
    fileType: string;
    createdAt: string | Date;
    summary?: any;
    graph?: any;
    mcq?: any;
}, {
    id: string;
    filename: string;
    fileType: string;
    createdAt: string | Date;
    summary?: any;
    graph?: any;
    mcq?: any;
}>;
