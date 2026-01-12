"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectMongo = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const connectMongo = async () => {
    try {
        const uri = process.env.MONGO_URI;
        if (!uri) {
            console.error('[Mongo] MONGO_URI not found in environment variables');
            return;
        }
        await mongoose_1.default.connect(uri);
        console.log('[Mongo] Connected to MongoDB');
    }
    catch (error) {
        console.error('[Mongo] Connection error:', error);
    }
};
exports.connectMongo = connectMongo;
