import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Anthropic from '@anthropic-ai/sdk';
import multer from 'multer';
import fs from 'fs';
import { Readable } from 'stream';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Multer setup for handling file uploads
const upload = multer({ dest: 'uploads/' });

// Initialize AI clients
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });


const streamToString = async (stream) => {
    const chunks = [];
    for await (const chunk of stream) {
        chunks.push(chunk);
    }
    return Buffer.concat(chunks).toString('base64');
};


app.post('/api/chat', upload.single('mediaFile'), async (req, res) => {
    const { prompt } = req.body;
    console.log.apply(req.body)
    const mediaFile = req.file;

    let chatGPTImageContent = null;
    let geminiContent = [];
    let claudeImageContent = null;

    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        if (mediaFile) {
            const base64Image = fs.readFileSync(mediaFile.path, { encoding: 'base64' });
              chatGPTImageContent = [
                { type: "image_url", image_url: { url: `data:${mediaFile.mimetype};base64,${base64Image}` } },
              ];

                geminiContent.push(prompt,
                    {
                        inlineData: {
                         data: base64Image,
                         mimeType: mediaFile.mimetype,
                        },
                    }
                );


            const fileBuffer = fs.readFileSync(mediaFile.path);
            const base64ClaudeImage = await streamToString(Readable.from(fileBuffer));

            claudeImageContent = {
                source: {
                    type: 'base64',
                    media_type: mediaFile.mimetype,
                    data: base64ClaudeImage,
                },
             }

            fs.unlinkSync(mediaFile.path);
        }

       if (prompt) {
            geminiContent.unshift(prompt)
        }


        const [chatGPTResponse, geminiResponse, claudeResponse] = await Promise.all([
            // ChatGPT request
            openai.chat.completions.create({
                 model: 'gpt-4o',
                    messages: [
                    {
                        role: 'user',
                        content: [
                           ...(prompt ? [{ type: "text", text: prompt }] : []),
                            ...(chatGPTImageContent ? chatGPTImageContent : [])
                         ]
                     },
                   ],
             }),
             // Gemini request
             (async () => {


                  const result = await model.generateContent(geminiContent);
                   return result.response;


                })(),
            // Claude request
        //    anthropic.messages.create({
        //       model: 'claude-3-5-sonnet-20241022',
        //          max_tokens: 1024,
        //          messages: [
        //              {
        //               role: 'user',
        //                  content: [
        //                     ...(prompt ? { type: 'text', text: prompt } : {}),
        //                     ...(claudeImageContent ? { type: 'image', image: claudeImageContent} : {}),
        //                    ]
        //              }
        //             ],
        //    })

        ]);

        res.json({
            chatgpt: chatGPTResponse.choices[0].message.content,
            gemini: geminiResponse.text(),
            // claude: claudeResponse.content[0].text
        });
    } catch (error) {
        console.error('Error:', error);
         res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});