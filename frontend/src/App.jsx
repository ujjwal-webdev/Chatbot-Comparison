import { useEffect, useRef, useState } from 'react';
import { Header } from './components/Header';
import { ChatForm } from './components/ChatForm';
import { ResponseColumn } from './components/ResponseColumn';
import { sendChatRequest } from './services/api';
import { RefreshCw } from 'lucide-react';

export default function App() {
    const [responses, setResponses] = useState([
        { model: 'ChatGPT', response: '', loading: false },
        { model: 'Gemini', response: '', loading: false },
        { model: 'Claude', response: '', loading: false },
    ]);
    
    // Store last request for retry functionality
    const lastRequestRef = useRef({ prompt: '', image: null });
    const requestSeqRef = useRef(0);
    const abortRef = useRef(null);

    useEffect(() => {
        return () => {
            abortRef.current?.abort?.();
        };
    }, []);

    const handleSubmit = async (prompt, image) => {
        // Store the request for potential retry
        lastRequestRef.current = { prompt, image };

        // Cancel any in-flight request
        abortRef.current?.abort?.();
        const controller = new AbortController();
        abortRef.current = controller;

        // Increment request sequence to ignore stale results
        const reqId = ++requestSeqRef.current;
        
        setResponses(prev => prev.map(r => ({ ...r, loading: true, error: undefined })));

        try {
            const apiResponses = await sendChatRequest(prompt, image, {
                signal: controller.signal,
                timeoutMs: Number(import.meta.env.VITE_REQUEST_TIMEOUT_MS || 60000)
            });

            // Ignore stale responses (newer request already started)
            if (reqId !== requestSeqRef.current) return;

            setResponses(apiResponses.map(r => ({
                model: r.model,
                response: r.response,
                error: r.error,
                loading: false
            })));
        } catch (error) {
            if (reqId !== requestSeqRef.current) return;
            setResponses(prev => prev.map(r => ({
                ...r,
                loading: false,
                error: error.message || 'An error occurred',
            })));
            throw error;
        }
    };

    const handleRetry = async () => {
        const { prompt, image } = lastRequestRef.current;
        
        if (!prompt && !image) {
            return; // No previous request to retry
        }

        // Retry all models (backend sends to all models at once)
        await handleSubmit(prompt, image);
    };

    const hasErrors = responses.some(r => r.error);
    const hasAnyResponse = responses.some(r => r.response || r.error);

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
            <Header />
            <main className="max-w-9xl mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto mb-8">
                    <ChatForm onSubmit={handleSubmit} />
                    
                    {/* Global Retry All Button */}
                    {hasErrors && hasAnyResponse && (
                        <div className="mt-4 flex justify-center">
                            <button
                                onClick={() => handleRetry()}
                                className="flex items-center gap-2 px-6 py-2 bg-srh-blue text-white rounded-lg hover:bg-srh-blue/90 transition-colors text-sm font-medium shadow-sm"
                            >
                                <RefreshCw className="w-4 h-4" />
                                Retry All Models
                            </button>
                        </div>
                    )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {responses.map((response, index) => (
                        <ResponseColumn 
                            key={`${response.model}-${index}`} 
                            data={response}
                        />
                    ))}
                </div>
            </main>
        </div>
    );
}
