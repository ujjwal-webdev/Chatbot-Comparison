// Remove trailing slashes and ensure proper URL format
const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/+$/, '');

const normalizeErrorMessage = async (response) => {
    // Prefer JSON error bodies like { error: "..." }
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
        try {
            const data = await response.json();
            if (typeof data?.error === 'string' && data.error.trim()) return data.error;
            if (typeof data?.message === 'string' && data.message.trim()) return data.message;
            return `HTTP error! status: ${response.status}`;
        } catch {
            return `HTTP error! status: ${response.status}`;
        }
    }

    // Fallback to text
    try {
        const text = await response.text();
        return text?.trim() ? text : `HTTP error! status: ${response.status}`;
    } catch {
        return `HTTP error! status: ${response.status}`;
    }
};

export async function sendChatRequest(prompt, file, options = {}) {
    try {
        const timeoutMs = Number(options.timeoutMs ?? 60000);
        const outerSignal = options.signal;
        const controller = new AbortController();

        let timeoutId;
        if (Number.isFinite(timeoutMs) && timeoutMs > 0) {
            timeoutId = setTimeout(() => controller.abort(new Error('timeout')), timeoutMs);
        }

        const onOuterAbort = () => controller.abort(new Error('aborted'));
        if (outerSignal) {
            if (outerSignal.aborted) onOuterAbort();
            else outerSignal.addEventListener('abort', onOuterAbort, { once: true });
        }

        const formData = new FormData();
        formData.append('prompt', prompt);
        if (file) {
            formData.append('file', file);
        }

        let response;
        try {
            response = await fetch(`${API_URL}/api/chat`, {
                method: 'POST',
                body: formData,
                signal: controller.signal
            });
        } finally {
            if (timeoutId) clearTimeout(timeoutId);
            if (outerSignal) outerSignal.removeEventListener('abort', onOuterAbort);
        }

        if (!response.ok) {
            const message = await normalizeErrorMessage(response);
            throw new Error(message);
        }

        const data = await response.json();
        return [
            { model: 'ChatGPT', response: data.chatgpt || '', error: data.errors?.chatgpt },
            { model: 'Gemini', response: data.gemini || '', error: data.errors?.gemini },
            { model: 'Claude', response: data.claude || '', error: data.errors?.claude }
        ];
    } catch (error) {
        if (error?.name === 'AbortError') {
            throw new Error('Request cancelled');
        }
        if (error instanceof Error && error.message === 'timeout') {
            throw new Error('Request timed out');
        }
        console.error('Error sending chat request:', error);
        throw error;
    }
}
