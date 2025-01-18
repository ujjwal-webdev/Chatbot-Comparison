import React, { useState } from 'react';
import { TestCase, TestResult, TestSuite } from '../types/testing';
import { runTest } from '../tests/testRunner';
import { mainTestSuite } from '../tests/testCases';
import { TestResults } from './TestResults';

export const TestRunner: React.FC = () => {
    const [results, setResults] = useState<TestResult[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [isRunning, setIsRunning] = useState(false);

    const handleRunTest = async (testCase: TestCase) => {
        setIsRunning(true);
        try {
            const result = await runTest(testCase);
            setResults(prev => [result, ...prev]);
        } catch (error) {
            console.error('Error running test:', error);
            // Handle error appropriately
        } finally {
            setIsRunning(false);
        }
    };

    const handleRunAllTests = async () => {
        setIsRunning(true);
        try {
            const allResults = await Promise.all(
                mainTestSuite.testCases.map(testCase => runTest(testCase))
            );
            setResults(prev => [...allResults, ...prev]);
        } catch (error) {
            console.error('Error running all tests:', error);
            // Handle error appropriately
        } finally {
            setIsRunning(false);
        }
    };

    const filteredTestCases = selectedCategory === 'all'
        ? mainTestSuite.testCases
        : mainTestSuite.testCases.filter(test => test.category === selectedCategory);

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-srh-blue mb-4">
                    AI Model Evaluation Suite
                </h1>
                <p className="text-gray-600 mb-6">
                    Test and compare the performance of different AI models across various categories.
                </p>

                <div className="flex flex-wrap gap-4 mb-6">
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-srh-blue"
                    >
                        <option value="all">All Categories</option>
                        {mainTestSuite.categories.map(category => (
                            <option key={category} value={category}>
                                {category.charAt(0).toUpperCase() + category.slice(1)}
                            </option>
                        ))}
                    </select>

                    <button
                        onClick={handleRunAllTests}
                        disabled={isRunning}
                        className="px-6 py-2 bg-srh-blue text-white rounded-lg hover:bg-srh-blue/90 
                                 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        {isRunning ? 'Running Tests...' : 'Run All Tests'}
                    </button>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredTestCases.map(testCase => (
                        <div
                            key={testCase.id}
                            className="p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="text-lg font-semibold">{testCase.title}</h3>
                                <span className="px-2 py-1 text-sm text-white bg-srh-blue rounded-full">
                                    {testCase.category}
                                </span>
                            </div>
                            
                            <p className="text-gray-600 mb-4">{testCase.description}</p>
                            
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-500">
                                    Difficulty: {testCase.difficulty}
                                </span>
                                <button
                                    onClick={() => handleRunTest(testCase)}
                                    disabled={isRunning}
                                    className="px-4 py-1 text-srh-blue border border-srh-blue rounded 
                                             hover:bg-srh-blue hover:text-white transition-colors
                                             disabled:bg-gray-100 disabled:border-gray-400 
                                             disabled:text-gray-400 disabled:cursor-not-allowed"
                                >
                                    Run Test
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="mt-12">
                <h2 className="text-2xl font-bold text-srh-blue mb-6">Test Results</h2>
                <TestResults results={results} />
            </div>
        </div>
    );
}; 