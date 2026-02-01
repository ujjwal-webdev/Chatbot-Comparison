/**
 * Formats API error messages into user-friendly messages
 */
export const formatErrorMessage = (error, model) => {
    if (!error) return null;

    const errorLower = error.toLowerCase();

    // OpenRouter / billing / credits (applies to any model when routed via OpenRouter)
    if (
        errorLower.includes('402') ||
        errorLower.includes('payment required') ||
        errorLower.includes('insufficient') ||
        errorLower.includes('credit')
    ) {
        return {
            title: 'Billing / Credits Required',
            message: 'Your OpenRouter account appears to have insufficient credits to run this request.',
            suggestion: 'Add credits in OpenRouter or switch to a provider/key that has an active billing plan.',
            link: 'https://openrouter.ai/settings/credits',
            type: 'billing'
        };
    }

    // ChatGPT Errors
    if (model === 'ChatGPT') {
        if (errorLower.includes('429') || errorLower.includes('quota') || errorLower.includes('exceeded')) {
            return {
                title: 'Quota Exceeded',
                message: 'Your OpenAI API quota has been exceeded. Please check your billing and usage limits.',
                suggestion: 'Visit your OpenAI dashboard to check your usage and upgrade your plan if needed.',
                link: 'https://platform.openai.com/usage',
                type: 'quota'
            };
        }
        if (errorLower.includes('401') || errorLower.includes('invalid api key') || errorLower.includes('authentication')) {
            return {
                title: 'Invalid API Key',
                message: 'Your OpenAI API key is invalid or expired.',
                suggestion: 'Please check your API key in the backend configuration.',
                type: 'auth'
            };
        }
        if (errorLower.includes('rate limit')) {
            return {
                title: 'Rate Limit Exceeded',
                message: 'Too many requests. Please wait a moment and try again.',
                suggestion: 'OpenAI has rate limits to prevent abuse. Try again in a few seconds.',
                type: 'rate-limit'
            };
        }
    }

    // Gemini Errors
    if (model === 'Gemini') {
        if (errorLower.includes('api key not valid') || errorLower.includes('invalid api key') || errorLower.includes('400')) {
            return {
                title: 'Invalid API Key',
                message: 'Your Google Gemini API key is invalid or missing.',
                suggestion: 'Please verify your GEMINI_API_KEY in the backend configuration.',
                link: 'https://aistudio.google.com/app/apikey',
                type: 'auth'
            };
        }
        if (errorLower.includes('quota') || errorLower.includes('429')) {
            return {
                title: 'Quota Exceeded',
                message: 'Your Gemini API quota has been exceeded.',
                suggestion: 'Check your Google Cloud Console for usage limits.',
                type: 'quota'
            };
        }
    }

    // Claude Errors
    if (model === 'Claude') {
        if (errorLower.includes('404') && errorLower.includes('model')) {
            return {
                title: 'Model Not Found',
                message: 'The specified Claude model is not available or the model name is incorrect.',
                suggestion: 'The model name may have changed. Please check the Anthropic API documentation for available models.',
                link: 'https://docs.anthropic.com/claude/docs/models-overview',
                type: 'model'
            };
        }
        if (errorLower.includes('401') || errorLower.includes('invalid api key') || errorLower.includes('authentication')) {
            return {
                title: 'Invalid API Key',
                message: 'Your Anthropic API key is invalid or expired.',
                suggestion: 'Please verify your ANTHROPIC_API_KEY in the backend configuration.',
                link: 'https://console.anthropic.com/',
                type: 'auth'
            };
        }
        if (errorLower.includes('quota') || errorLower.includes('429')) {
            return {
                title: 'Quota Exceeded',
                message: 'Your Anthropic API quota has been exceeded.',
                suggestion: 'Check your Anthropic console for usage limits and billing information.',
                type: 'quota'
            };
        }
    }

    // Generic errors
    if (errorLower.includes('network') || errorLower.includes('fetch') || errorLower.includes('connection')) {
        return {
            title: 'Connection Error',
            message: 'Unable to connect to the AI service. Please check your internet connection.',
            suggestion: 'Verify your network connection and try again.',
            type: 'network'
        };
    }

    if (errorLower.includes('timeout')) {
        return {
            title: 'Request Timeout',
            message: 'The request took too long to complete.',
            suggestion: 'The AI service may be experiencing high load. Please try again.',
            type: 'timeout'
        };
    }

    // Default fallback
    return {
        title: 'Error',
        message: error.length > 200 ? error.substring(0, 200) + '...' : error,
        suggestion: 'Please try again or contact support if the issue persists.',
        type: 'unknown'
    };
};
