import mongoose from 'mongoose';

export const connectMongo = async () => {
    try {
        const uri = process.env.MONGO_URI;
        if (!uri) {
            console.error('[Mongo] MONGO_URI not found in environment variables');
            return;
        }
        await mongoose.connect(uri);
        console.log('[Mongo] Connected to MongoDB');
    } catch (error) {
        console.error('[Mongo] Connection error:', error);
    }
};
