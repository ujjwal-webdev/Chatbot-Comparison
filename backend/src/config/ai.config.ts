import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

// Load environment variables in development
if (process.env.NODE_ENV === 'development') {
    dotenv.config();
}

const client = new SecretManagerServiceClient();

// Function to fetch secrets dynamically in production
async function getSecret(secretName: string): Promise<string> {
    try {
        const [version] = await client.accessSecretVersion({
            name: `projects/ai-model-comparison-20250131/secrets/${secretName}/versions/latest`,
        });
        return version.payload?.data?.toString() || '';
    } catch (error) {
        console.error(`Failed to access secret ${secretName}:`, error);
        throw new Error(`Failed to access secret: ${secretName}`);
    }
}

// Define mutable API client variables
let openai: OpenAI;
let genAI: GoogleGenerativeAI;
let anthropic: Anthropic;

// Function to initialize API clients
export async function initializeAIClients() {
    let openaiKey, geminiKey, anthropicKey;

    if (process.env.NODE_ENV === 'development') {
        if (!process.env.OPENAI_API_KEY || !process.env.GEMINI_API_KEY || !process.env.ANTHROPIC_API_KEY) {
            throw new Error('Missing required API keys in environment variables');
        }
        openaiKey = process.env.OPENAI_API_KEY;
        geminiKey = process.env.GEMINI_API_KEY;
        anthropicKey = process.env.ANTHROPIC_API_KEY;
    } else {
        openaiKey = await getSecret('openai-api-key');
        geminiKey = await getSecret('google-api-key');
        anthropicKey = await getSecret('anthropic-api-key');
    }

    // Initialize API clients with the retrieved keys
    openai = new OpenAI({ apiKey: openaiKey });
    genAI = new GoogleGenerativeAI(geminiKey);
    anthropic = new Anthropic({ apiKey: anthropicKey });

    console.log("✅ AI clients initialized successfully.");
}

// Export API clients after initialization
export { openai, genAI, anthropic };
