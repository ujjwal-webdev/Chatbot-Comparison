import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.OPENAI_API_KEY || !process.env.GEMINI_API_KEY || !process.env.ANTHROPIC_API_KEY) {
    throw new Error('Missing required API keys in environment variables');
}

export const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
export const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
export const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY }); 