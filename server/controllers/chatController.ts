import type { Request as ExpressRequest, Response as ExpressResponse } from 'express';
import { openai, genAI, anthropic } from '../config/ai.config';
import { streamToString, getBase64Image, cleanupFile } from '../utils/fileUtils';
import { Readable } from 'stream';
import { ChatCompletionContentPart } from 'openai/resources/chat/completions';

// Extend Express Request to include multer's file
interface MulterRequest extends ExpressRequest {
    file?: {
        fieldname: string;
        originalname: string;
        encoding: string;
        mimetype: string;
        size: number;
        destination: string;
        filename: string;
        path: string;
        buffer: Buffer;
    };
}

interface ChatGPTImageContent {
    type: "image_url";
    image_url: { url: string };
}

interface ClaudeImageContent {
    source: {
        type: 'base64';
        media_type: ClaudeMediaType;
        data: string;
    };
}

type ClaudeMediaType = 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp';

interface TextBlock {
    type: 'text';
    text: string;
}

interface ImageBlock {
    type: 'image';
    source: {
        type: 'base64';
        media_type: ClaudeMediaType;
        data: string;
    };
}

type ClaudeMessage = TextBlock | ImageBlock;

const isValidClaudeMediaType = (mediaType: string): mediaType is ClaudeMediaType => {
    return ['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(mediaType);
};

export const handleChat = async (req: MulterRequest, res: ExpressResponse): Promise<void> => {
    const { prompt } = req.body;
    const mediaFile = req.file;

    let chatGPTImageContent: ChatGPTImageContent[] | undefined;
    let geminiContent: any[] = [];
    let claudeImageContent: ClaudeImageContent | undefined;

    // Handle each AI service independently
    const results = {
        chatgpt: null as string | null,
        gemini: null as string | null,
        claude: null as string | null,
        errors: {} as Record<string, string>
    };

    try {
        if (mediaFile) {
            if (!isValidClaudeMediaType(mediaFile.mimetype)) {
                throw new Error('Invalid image format. Supported formats are: JPEG, PNG, GIF, and WebP');
            }

            const base64Image = getBase64Image(mediaFile.path);
            chatGPTImageContent = [
                { type: "image_url", image_url: { url: `data:${mediaFile.mimetype};base64,${base64Image}` } },
            ];

            geminiContent.push({
                inlineData: {
                    data: base64Image,
                    mimeType: mediaFile.mimetype,
                },
            });

            const fileBuffer = await streamToString(Readable.from(Buffer.from(base64Image, 'base64')));
            claudeImageContent = {
                source: {
                    type: 'base64',
                    media_type: mediaFile.mimetype as ClaudeMediaType,
                    data: fileBuffer,
                },
            };

            cleanupFile(mediaFile.path);
        }

        if (prompt) {
            geminiContent.unshift(prompt);
        }

        // Process all AI services in parallel
        await Promise.all([
            // ChatGPT
            (async () => {
                if (process.env.OPENAI_API_KEY) {
                    try {
                        const messages: ChatCompletionContentPart[] = [];
                        if (prompt) {
                            messages.push({ type: "text", text: prompt });
                        }
                        if (chatGPTImageContent) {
                            messages.push(...chatGPTImageContent);
                        }

                        const chatGPTResponse = await openai.chat.completions.create({
                            model: 'gpt-4o',
                            messages: [{ role: 'user', content: messages }],
                            max_tokens: 500,
                        });
                        results.chatgpt = chatGPTResponse.choices[0].message.content;
                    } catch (error: any) {
                        results.errors.chatgpt = error.message || 'An error occurred with ChatGPT';
                    }
                }
            })(),

            // Gemini
            (async () => {
                if (process.env.GEMINI_API_KEY) {
                    try {
                        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
                        let retryCount = 0;
                        const maxRetries = 2;

                        while (retryCount < maxRetries) {
                            try {
                                const geminiResponse = await model.generateContent(geminiContent);
                                results.gemini = await geminiResponse.response.text();
                                break;
                            } catch (error: any) {
                                if (error.message?.includes('503') && retryCount < maxRetries - 1) {
                                    await new Promise(resolve => setTimeout(resolve, 1000));
                                    retryCount++;
                                    continue;
                                }
                                throw error;
                            }
                        }
                    } catch (error: any) {
                        let errorMessage = 'An error occurred with Gemini';
                        if (error.message?.includes('503')) {
                            errorMessage = 'Gemini is currently experiencing high traffic. Please try again in a moment.';
                        } else if (error.message) {
                            errorMessage = error.message;
                        }
                        results.errors.gemini = errorMessage;
                    }
                }
            })(),

            // Claude
            (async () => {
                if (process.env.ANTHROPIC_API_KEY) {
                    try {
                        const claudeMessages: ClaudeMessage[] = [];
                        if (prompt) {
                            claudeMessages.push({ type: 'text', text: prompt });
                        }
                        if (claudeImageContent && isValidClaudeMediaType(claudeImageContent.source.media_type)) {
                            claudeMessages.push({
                                type: 'image',
                                source: claudeImageContent.source
                            });
                        }

                        const claudeResponse = await anthropic.messages.create({
                            model: 'claude-3-sonnet-20240229',
                            max_tokens: 1024,
                            messages: [{ role: 'user', content: claudeMessages }],
                        });
                        results.claude = claudeResponse.content[0].text;
                    } catch (error: any) {
                        results.errors.claude = error.message || 'An error occurred with Claude';
                    }
                }
            })()
        ]);

        res.json(results);
    } catch (error: any) {
        console.error('Error:', error);
        res.status(500).json({ 
            error: error.message || 'An unexpected error occurred',
            errors: {}
        });
    }
}; 