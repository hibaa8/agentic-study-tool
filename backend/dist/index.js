"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_session_1 = __importDefault(require("express-session"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const syncRoutes_1 = __importDefault(require("./routes/syncRoutes"));
const agentRoutes_1 = __importDefault(require("./routes/agentRoutes"));
const learningRoutes_1 = __importDefault(require("./routes/learningRoutes"));
const calendarRoutes_1 = __importDefault(require("./routes/calendarRoutes"));
const emailRoutes_1 = __importDefault(require("./routes/emailRoutes"));
const mongo_1 = require("./utils/mongo");
const mongoRoutes_1 = __importDefault(require("./routes/mongoRoutes"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5001;
// Connect to MongoDB
(0, mongo_1.connectMongo)();
// Middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.APP_BASE_URL,
    credentials: true,
}));
app.use(express_1.default.json());
// Session setup (simple in-memory for dev)
app.use((0, express_session_1.default)({
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
app.use('/auth', authRoutes_1.default);
app.use('/sync', syncRoutes_1.default);
app.use('/agent', agentRoutes_1.default);
app.use('/learning', learningRoutes_1.default);
app.use('/calendar', calendarRoutes_1.default);
app.use('/email', emailRoutes_1.default);
app.use('/save', mongoRoutes_1.default);
app.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`);
});
