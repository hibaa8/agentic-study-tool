import mongoose, { Schema, Document } from 'mongoose';

export interface ISavedSummary extends Document {
    userId: string;
    sourceFile: string;
    summaryText: string;
    createdAt: Date;
}

const SavedSummarySchema: Schema = new Schema({
    userId: { type: String, required: true },
    sourceFile: { type: String, required: true },
    summaryText: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});

export const SavedSummary = mongoose.model<ISavedSummary>('SavedSummary', SavedSummarySchema);
