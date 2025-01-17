import React from 'react';
import { Bot } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { AIResponse } from '../types';

interface ResponseColumnProps {
  data: AIResponse;
}

export function ResponseColumn({ data }: ResponseColumnProps) {
  return (
    <div className="flex-1 min-w-0 p-6 bg-white rounded-lg shadow-lg">
      <div className="flex items-center gap-2 mb-4">
        <Bot className="w-6 h-6 text-blue-600" />
        <h2 className="text-xl font-bold text-gray-900">{data.model}</h2>
      </div>
      
      <div className="h-[calc(100vh-250px)] overflow-y-auto">
        {data.loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : data.error ? (
          <div className="text-red-500">{data.error}</div>
        ) : (
          <div className="prose prose-sm max-w-none">
            <ReactMarkdown>{data.response}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}