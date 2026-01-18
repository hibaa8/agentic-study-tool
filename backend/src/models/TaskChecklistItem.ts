import mongoose, { Schema, Document } from 'mongoose';

export interface ITaskChecklistItem extends Document {
    userId: string;
    taskId: string;
    title: string;
    description?: string;
    completed: boolean;
    createdAt: Date;
    completedAt?: Date;
}

const TaskChecklistItemSchema: Schema = new Schema({
    userId: { type: String, required: true },
    taskId: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String },
    completed: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    completedAt: { type: Date },
});

export const TaskChecklistItem = mongoose.model<ITaskChecklistItem>('TaskChecklistItem', TaskChecklistItemSchema);
