import mongoose, { Schema, Document } from 'mongoose';

export interface ISavedLearningSession extends Document {
    userId: string;
    filename: string;
    savedAt: Date;
    summary?: any;
    graph?: any;
    quiz?: any;
}

const SavedLearningSessionSchema: Schema = new Schema({
    userId: { type: String, required: true },
    filename: { type: String, required: true },
    savedAt: { type: Date, default: Date.now },
    summary: { type: Schema.Types.Mixed },
    graph: { type: Schema.Types.Mixed },
    quiz: { type: Schema.Types.Mixed },
});

export const SavedLearningSession = mongoose.model<ISavedLearningSession>('SavedLearningSession', SavedLearningSessionSchema);
