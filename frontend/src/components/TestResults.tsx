import React from 'react';
import { TestResult, ModelResponse, TestCase } from '../types/testing';

interface TestResultsProps {
    results: TestResult[];
    onRunTest?: (testCase: TestCase) => void;
}

export const TestResults: React.FC<TestResultsProps> = ({ results, onRunTest }) => {
    const getScoreColor = (score: number): string => {
        if (score >= 0.8) return 'text-green-600';
        if (score >= 0.6) return 'text-yellow-600';
        return 'text-red-600';
    };

    const renderModelResponse = (response: ModelResponse) => {
        const avgScore = Object.values(response.scores).reduce((a, b) => a + b, 0) / 4;
        
        return (
            <div key={response.model} className="mb-6 p-4 bg-white rounded-lg shadow">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-semibold">{response.model}</h3>
                    <span className={`font-bold ${getScoreColor(avgScore)}`}>
                        {(avgScore * 100).toFixed(1)}%
                    </span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                    {Object.entries(response.scores).map(([criterion, score]) => (
                        <div key={criterion} className="flex justify-between items-center">
                            <span className="text-gray-600 capitalize">{criterion}</span>
                            <span className={getScoreColor(score)}>
                                {(score * 100).toFixed(1)}%
                            </span>
                        </div>
                    ))}
                </div>
                
                <div className="mt-4 p-3 bg-gray-50 rounded">
                    <p className="text-gray-700 whitespace-pre-wrap">{response.response}</p>
                </div>
                
                {response.error && (
                    <div className="mt-2 p-2 bg-red-50 text-red-700 rounded">
                        {response.error}
                    </div>
                )}
                
                <div className="mt-2 text-sm text-gray-500">
                    Processing time: {response.processingTime}ms
                </div>
            </div>
        );
    };

    const renderTestResult = (result: TestResult) => {
        return (
            <div key={result.testId} className="mb-8 p-6 bg-white rounded-xl shadow-lg">
                <div className="mb-4">
                    <span className="inline-block px-3 py-1 text-sm font-semibold text-white bg-srh-blue rounded-full">
                        {result.category}
                    </span>
                    <h2 className="mt-2 text-xl font-bold">{result.prompt}</h2>
                    {result.imageUrl && (
                        <img 
                            src={result.imageUrl} 
                            alt="Test prompt" 
                            className="mt-2 max-w-md rounded"
                        />
                    )}
                </div>

                <div className="space-y-4">
                    {result.responses.map(renderModelResponse)}
                </div>

                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <h3 className="text-lg font-semibold mb-2">Analysis</h3>
                    <p className="whitespace-pre-wrap text-gray-700">{result.comparison.analysis}</p>
                    
                    <h3 className="text-lg font-semibold mt-4 mb-2">Recommendations</h3>
                    <ul className="list-disc list-inside space-y-1">
                        {result.comparison.recommendations.map((rec, index) => (
                            <li key={index} className="text-gray-700">{rec}</li>
                        ))}
                    </ul>
                    
                    <div className="mt-4 flex items-center">
                        <span className="text-gray-600">Best Performer:</span>
                        <span className="ml-2 font-semibold text-srh-blue">
                            {result.comparison.bestPerformer}
                        </span>
                    </div>
                </div>

                <div className="mt-4 text-sm text-gray-500">
                    Test run at: {result.timestamp.toLocaleString()}
                </div>
            </div>
        );
    };

    return (
        <div className="max-w-4xl mx-auto py-8">
            {results.length === 0 ? (
                <div className="text-center text-gray-500">
                    No test results available yet. Run some tests to see the results here.
                </div>
            ) : (
                <div className="space-y-8">
                    {results.map(renderTestResult)}
                </div>
            )}
        </div>
    );
}; 