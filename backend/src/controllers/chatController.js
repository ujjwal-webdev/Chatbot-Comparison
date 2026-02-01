import { openai } from '../config/ai.config.js';
import fsp from 'fs/promises';

const isValidImageMediaType = (mediaType) => {
    return ['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(mediaType);
};

const toCleanString = (value) => {
    if (typeof value === 'string') return value;
    if (value instanceof Error) return value.message;
    try {
        return JSON.stringify(value);
    } catch {
        return String(value);
    }
};

const truncate = (s, max = 220) => {
    const str = String(s || '');
    if (str.length <= max) return str;
    return `${str.slice(0, max)}...`;
};

const sanitizeProviderErrorForClient = (err, isProd) => {
    const raw = toCleanString(err).replace(/\s+/g, ' ').trim();
    const status = typeof err?.status === 'number' ? err.status : undefined;
    const msg = status && !raw.includes(String(status)) ? `${status} ${raw}` : raw;
    const lower = msg.toLowerCase();

    // In production, only surface safe, high-signal messages.
    if (isProd) {
        // Billing/credits/quota are safe and useful to show to users.
        if (
            lower.includes('402') ||
            lower.includes('payment required') ||
            lower.includes('insufficient') ||
            lower.includes('credit') ||
            lower.includes('quota') ||
            lower.includes('429') ||
            lower.includes('rate limit') ||
            lower.includes('401') ||
            lower.includes('invalid api key') ||
            lower.includes('authentication')
        ) {
            return truncate(msg);
        }
        return 'Request failed';
    }

    return truncate(msg, 1000);
};

const withTimeout = async (promise, ms, label) => {
    let timeoutId;
    const timeoutPromise = new Promise((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
    });

    try {
        return await Promise.race([promise, timeoutPromise]);
    } finally {
        clearTimeout(timeoutId);
    }
};

export const handleChat = async (req, res) => {
    const { prompt } = req.body || {};
    const mediaFile = req.file;
    const errors = {};
    let chatgptResponse = '';
    let geminiResponse = '';
    let claudeResponse = '';
    const isProd = process.env.NODE_ENV === 'production';
    const timeoutMs = Number(process.env.PROVIDER_TIMEOUT_MS || 30000);
    const maxPromptChars = Number(process.env.PROMPT_MAX_CHARS || 10000);

    if (!openai) {
        return res.status(500).json({ error: 'AI client is not initialized' });
    }

    if (typeof prompt !== 'string' || prompt.trim().length === 0) {
        return res.status(400).json({ error: 'Prompt is required' });
    }
    if (prompt.length > maxPromptChars) {
        return res.status(400).json({ error: `Prompt too long (max ${maxPromptChars} chars)` });
    }

    try {
        if (mediaFile && !isValidImageMediaType(mediaFile.mimetype)) {
            return res.status(400).json({ error: 'Invalid image format. Supported formats are: JPEG, PNG, GIF, and WebP' });
        }

        const imageBase64 = mediaFile ? await fsp.readFile(mediaFile.path, { encoding: 'base64' }) : null;

        const buildOpenAIStyleMessages = () => {
            if (!mediaFile) return [{ role: 'user', content: prompt }];
            return [
                {
                    role: 'user',
                    content: [
                        { type: 'text', text: prompt },
                        {
                            type: 'image_url',
                            image_url: {
                                url: `data:${mediaFile.mimetype};base64,${imageBase64}`
                            }
                        }
                    ]
                }
            ];
        };

        const baseMessages = buildOpenAIStyleMessages();

        // Process requests in parallel
        await Promise.all([
            // ChatGPT (via OpenRouter)
            (async () => {
                try {
                    const completion = await withTimeout(
                        openai.chat.completions.create({
                            model: process.env.OPENROUTER_MODEL_CHATGPT || 'openai/gpt-4o',
                            messages: baseMessages,
                            max_tokens: Number(process.env.OPENAI_MAX_TOKENS || 4096)
                        }),
                        timeoutMs,
                        'ChatGPT'
                    );

                    chatgptResponse = completion.choices[0]?.message?.content || '';
                } catch (error) {
                    console.error('ChatGPT Error:', error);
                    errors.chatgpt = sanitizeProviderErrorForClient(error, isProd);
                }
            })(),

            // Gemini (via OpenRouter)
            (async () => {
                try {
                    const completion = await withTimeout(
                        openai.chat.completions.create({
                            model: process.env.OPENROUTER_MODEL_GEMINI || 'google/gemini-1.5-flash',
                            messages: baseMessages,
                            max_tokens: Number(process.env.GEMINI_MAX_TOKENS || 4096)
                        }),
                        timeoutMs,
                        'Gemini'
                    );

                    geminiResponse = completion.choices[0]?.message?.content || '';
                } catch (error) {
                    console.error('Gemini Error:', error);
                    errors.gemini = sanitizeProviderErrorForClient(error, isProd);
                }
            })(),

            // Claude (via OpenRouter)
            (async () => {
                try {
                    const response = await withTimeout(
                        openai.chat.completions.create({
                            model: process.env.OPENROUTER_MODEL_CLAUDE || 'anthropic/claude-3.5-sonnet',
                            messages: baseMessages,
                            max_tokens: Number(process.env.CLAUDE_MAX_TOKENS || 4096)
                        }),
                        timeoutMs,
                        'Claude'
                    );

                    claudeResponse = response.choices[0]?.message?.content || '';
                } catch (error) {
                    console.error('Claude Error:', error);
                    errors.claude = sanitizeProviderErrorForClient(error, isProd);
                }
            })(),
        ]);

        res.json({
            chatgpt: chatgptResponse,
            gemini: geminiResponse,
            claude: claudeResponse,
            errors: Object.keys(errors).length > 0 ? errors : undefined
        });
    } catch (error) {
        console.error('General Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    } finally {
        // Always clean up the uploaded file (best-effort)
        if (mediaFile?.path) {
            try {
                await fsp.unlink(mediaFile.path);
            } catch {
                // ignore cleanup failures
            }
        }
    }
};
