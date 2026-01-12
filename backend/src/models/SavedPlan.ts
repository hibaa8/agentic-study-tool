import mongoose, { Schema, Document } from 'mongoose';

export interface ISavedPlan extends Document {
    userId: string;
    weekStartDate: Date;
    planJson: string; // Storing the full JSON structure
    createdAt: Date;
}

const SavedPlanSchema: Schema = new Schema({
    userId: { type: String, required: true },
    weekStartDate: { type: Date, required: true },
    planJson: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});

export const SavedPlan = mongoose.model<ISavedPlan>('SavedPlan', SavedPlanSchema);
