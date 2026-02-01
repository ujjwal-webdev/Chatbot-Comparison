import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import chatRoutes from './routes/chatRoutes.js';
import { initializeAIClients } from './config/ai.config.js';

dotenv.config();

const app = express();

// Middleware
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

app.use(
    cors({
        origin: (origin, cb) => {
            // Allow non-browser clients (curl/postman) with no Origin header
            if (!origin) return cb(null, true);
            if (allowedOrigins.includes(origin)) return cb(null, true);
            return cb(new Error(`CORS blocked for origin: ${origin}`), false);
        }
    })
);

app.use(express.json({ limit: process.env.JSON_BODY_LIMIT || '1mb' }));

app.use(
    '/api',
    rateLimit({
        windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000),
        limit: Number(process.env.RATE_LIMIT_MAX || 60),
        standardHeaders: 'draft-7',
        legacyHeaders: false
    })
);

// Routes
app.use('/api', chatRoutes);

// Health check endpoint
app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'healthy' });
});

const PORT = process.env.PORT || 3000;
async function startServer() {
    try {
        console.log("🔄 Initializing AI clients...");
        await initializeAIClients(); // Ensure API clients are ready before starting the server
        console.log("AI clients initialized. Starting server...");

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Failed to initialize AI clients:", error);
        process.exit(1); // Exit process if initialization fails
    }
}

startServer();
