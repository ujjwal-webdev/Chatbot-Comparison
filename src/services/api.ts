import axios from 'axios';
import { AIResponse } from '../types';

// Remove trailing slashes and ensure proper URL format
const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/+$/, '');

export const sendChatRequest = async (prompt: string, image: File | null): Promise<AIResponse[]> => {
    const formData = new FormData();
    
    if (prompt) {
        formData.append('prompt', prompt);
    }
    
    if (image) {
        formData.append('mediaFile', image);
    }

    const response = await axios.post(
        `${API_URL}/api/chat`,
        formData,
        {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        }
    );

    const { chatgpt, gemini, claude, errors } = response.data;

    return [
        { 
            model: 'ChatGPT', 
            response: chatgpt || '', 
            loading: false,
            error: errors?.chatgpt
        },
        { 
            model: 'Gemini', 
            response: gemini || '', 
            loading: false,
            error: errors?.gemini
        },
        { 
            model: 'Claude', 
            response: claude || '', 
            loading: false,
            error: errors?.claude
        }
    ];
}; 