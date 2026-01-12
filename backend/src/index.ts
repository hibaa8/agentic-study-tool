import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import session from 'express-session';
import authRoutes from './routes/authRoutes';
import syncRoutes from './routes/syncRoutes';
import agentRoutes from './routes/agentRoutes';
import learningRoutes from './routes/learningRoutes';
import calendarRoutes from './routes/calendarRoutes';
import emailRoutes from './routes/emailRoutes';

import { connectMongo } from './utils/mongo';
import mongoRoutes from './routes/mongoRoutes';

const app = express();
const PORT = process.env.PORT || 5001;

// Connect to MongoDB
connectMongo();

// Middleware
app.use(helmet());
app.use(cors({
    origin: process.env.APP_BASE_URL,
    credentials: true,
}));
app.use(express.json());

// Session setup (simple in-memory for dev)
app.use(session({
    secret: process.env.SESSION_SECRET || 'dev_secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Routes
app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.use('/auth', authRoutes);
app.use('/sync', syncRoutes);
app.use('/agent', agentRoutes);
app.use('/learning', learningRoutes);
app.use('/calendar', calendarRoutes);
app.use('/email', emailRoutes);
app.use('/save', mongoRoutes);

app.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`);
});
