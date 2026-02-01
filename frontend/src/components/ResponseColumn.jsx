import { Bot, Loader2, AlertCircle, ExternalLink } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { formatErrorMessage } from '../utils/errorFormatter';

export const ResponseColumn = ({ data }) => {
    const getGradientByModel = (model) => {
        switch (model) {
            case 'ChatGPT':
                return 'from-srh-blue to-srh-blue/80';
            case 'Gemini':
                return 'from-srh-orange to-srh-orange/80';
            case 'Claude':
                return 'from-srh-blue-light to-srh-blue-light/80';
            default:
                return 'from-gray-500 to-gray-600';
        }
    };

    const errorInfo = data.error ? formatErrorMessage(data.error, data.model) : null;

    return (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-srh-blue/10">
            {/* Header */}
            <div className={`p-4 bg-gradient-to-r ${getGradientByModel(data.model)} flex items-center gap-2`}>
                <Bot className="w-6 h-6 text-white" />
                <h2 className="text-lg font-semibold text-white">{data.model}</h2>
            </div>

            {/* Content */}
            <div className="p-4 min-h-[200px] relative overflow-y-auto">
                {data.loading ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90">
                        <Loader2 className="w-8 h-8 text-srh-blue animate-spin" />
                    </div>
                ) : errorInfo ? (
                    <div className="space-y-3">
                        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                                <h3 className="font-semibold text-red-800 mb-1">{errorInfo.title}</h3>
                                <p className="text-sm text-red-700 mb-2">{errorInfo.message}</p>
                                {errorInfo.suggestion && (
                                    <div className="mt-3 p-2 bg-red-100 rounded border-l-4 border-red-400">
                                        <p className="text-xs text-red-800 font-medium mb-1">💡 Suggestion:</p>
                                        <p className="text-xs text-red-700">{errorInfo.suggestion}</p>
                                    </div>
                                )}
                                {errorInfo.link && (
                                    <a
                                        href={errorInfo.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 mt-2 text-xs text-red-600 hover:text-red-800 underline"
                                    >
                                        Learn more <ExternalLink className="w-3 h-3" />
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="prose prose-sm max-w-none prose-headings:font-semibold prose-a:text-srh-blue overflow-x-auto">
                        {data.response ? (
                            <ReactMarkdown>{data.response}</ReactMarkdown>
                        ) : (
                            <p className="text-gray-500 italic">No response yet. Try sending a message!</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
