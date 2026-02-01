import OpenAI from 'openai';

// Define mutable API client variable
let openai;

// Function to initialize API clients
export async function initializeAIClients() {
    // OpenRouter provides an OpenAI-compatible API surface.
    const openrouterKey = process.env.OPENROUTER_API_KEY;
    if (!openrouterKey) {
        throw new Error('Missing required API key. Please set OPENROUTER_API_KEY.');
    }

    const baseURL = process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1';
    const siteUrl = process.env.OPENROUTER_SITE_URL; // recommended by OpenRouter
    const appName = process.env.OPENROUTER_APP_NAME; // recommended by OpenRouter

    openai = new OpenAI({
        apiKey: openrouterKey,
        baseURL,
        defaultHeaders: {
            ...(siteUrl ? { 'HTTP-Referer': siteUrl } : {}),
            ...(appName ? { 'X-Title': appName } : {})
        }
    });

    console.log("✅ OpenRouter client initialized successfully.");
}

// Export API clients after initialization
export { openai };
