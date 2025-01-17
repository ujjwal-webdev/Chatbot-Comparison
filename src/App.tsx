import React, { useState } from 'react';
import { Send, Sparkles } from 'lucide-react';
import { ResponseColumn } from './components/ResponseColumn';
import { AIResponse } from './types';
import axios from 'axios';
import { isAxiosError } from 'axios';

// const API_URL = process.env.API_URL || 'http://localhost:3000';
type AIResponseExtended = AIResponse & { error?: string };

export default function App() {
    const [prompt, setPrompt] = useState('');
    const [responses, setResponses] = useState<AIResponseExtended[]>([
        { model: 'ChatGPT', response: '', loading: false },
        { model: 'Gemini', response: '', loading: false },
        { model: 'Claude', response: '', loading: false },
    ]);
    const [selectedImage, setSelectedImage] = useState<File | null>(null);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Set loading state for all models
        setResponses(prev => prev.map(r => ({ ...r, loading: true, error: undefined })));

        const formData = new FormData();

        if (prompt) {
            formData.append('prompt', prompt);
        }

        if (selectedImage) {
            formData.append('mediaFile', selectedImage);
        }


        // **DEBUGGING: Log FormData before sending**
        console.log('FormData before sending:');
        for (const [key, value] of formData.entries()) {
            console.log(key, value);
        }

        try {
            const response = await axios.post(
                `http://localhost:3000/api/chat`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    }
                }
            );

            if (response.data) {
                setResponses([
                  { model: 'ChatGPT', response: response.data.chatgpt, loading: false },
                  { model: 'Gemini', response: response.data.gemini, loading: false },
                   { model: 'Claude', response: response.data.claude, loading: false }
                ]);
           }

        } catch (error) {
            if (isAxiosError(error)) {
                setResponses(prev => prev.map(r => ({
                    ...r,
                    loading: false,
                    error: error.message || 'An error occurred',
                })));
            }
        } finally {
            setPrompt('');
            setSelectedImage(null)
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setSelectedImage(e.target.files[0]);
        } else {
            setSelectedImage(null);
        }
    };


    return (
        <div className="min-h-screen bg-gray-100">
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center gap-2 justify-center">
                        <Sparkles className="w-6 h-6 text-blue-600" />
                        <h1 className="text-xl font-bold text-gray-900">Chatbot Comparison</h1>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-6">
                <form onSubmit={handleSubmit} className="mb-6">
                    <div className="flex gap-4 mb-4">
                        <input
                            type="text"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="Enter your prompt here (optional)..."
                            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />  
                    </div>
                   <div className="flex justify-center">
                    <button
                        type="submit"
                        className="px-6 w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center gap-2"
                    >
                        <Send className="w-4 h-4" />
                        Send
                    </button>
                    </div>
                </form>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {responses.map((response, index) => (
                        <ResponseColumn key={index} data={response} />
                    ))}
                </div>
            </main>
        </div>
    );
}