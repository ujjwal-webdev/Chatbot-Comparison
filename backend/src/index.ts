import express from 'express';
import type { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import chatRoutes from './routes/chatRoutes';
import { initializeAIClients } from './config/ai.config';

dotenv.config();

const app: Application = express();

// Middleware
app.use(cors());
app.use(express.json());

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
        console.log("✅ AI clients initialized. Starting server...");

        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error("❌ Failed to initialize AI clients:", error);
        process.exit(1); // Exit process if initialization fails
    }
}

startServer();