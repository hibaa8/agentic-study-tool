import mongoose, { Schema, Document } from 'mongoose';

export interface ICalendarActivity extends Document {
    userId: string;
    eventId: string;
    title: string;
    start: Date;
    end: Date;
    addedToCalendar: boolean;
    addedAt?: Date;
    expiresAt: Date; // 24 hours after adding
}

const CalendarActivitySchema: Schema = new Schema({
    userId: { type: String, required: true },
    eventId: { type: String, required: true },
    title: { type: String, required: true },
    start: { type: Date, required: true },
    end: { type: Date, required: true },
    addedToCalendar: { type: Boolean, default: false },
    addedAt: { type: Date },
    expiresAt: { type: Date },
});

export const CalendarActivity = mongoose.model<ICalendarActivity>('CalendarActivity', CalendarActivitySchema);
