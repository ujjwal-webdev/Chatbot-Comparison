import { TestCase, TestSuite } from '../types/testing';
import { v4 as uuidv4 } from 'uuid';

const textGenerationTests: TestCase[] = [
    {
        id: uuidv4(),
        category: 'text',
        title: 'Scientific Explanation',
        description: 'Test the ability to explain complex scientific concepts clearly and accurately',
        prompt: 'Explain the process of photosynthesis, including both light-dependent and light-independent reactions. Include specific molecules and enzymes involved.',
        evaluationCriteria: ['factual accuracy', 'completeness', 'clarity', 'technical precision'],
        difficulty: 'medium'
    },
    {
        id: uuidv4(),
        category: 'text',
        title: 'Creative Writing',
        description: 'Test creative writing abilities and narrative coherence',
        prompt: 'Write a short story about a time traveler who accidentally changes a significant historical event. Include the consequences of their actions.',
        evaluationCriteria: ['creativity', 'narrative coherence', 'character development', 'language quality'],
        difficulty: 'hard'
    }
];

const codeGenerationTests: TestCase[] = [
    {
        id: uuidv4(),
        category: 'code',
        title: 'Algorithm Implementation',
        description: 'Test ability to implement efficient algorithms',
        prompt: 'Implement a function to find the nth Fibonacci number using dynamic programming. Include type annotations, error handling, and performance optimization.',
        evaluationCriteria: ['correctness', 'efficiency', 'code style', 'error handling'],
        difficulty: 'medium'
    },
    {
        id: uuidv4(),
        category: 'code',
        title: 'API Development',
        description: 'Test ability to create secure and well-structured APIs',
        prompt: 'Create a TypeScript Express.js endpoint for user authentication. Include password hashing, JWT token generation, and proper error handling.',
        evaluationCriteria: ['security', 'best practices', 'error handling', 'documentation'],
        difficulty: 'hard'
    }
];

const mathTests: TestCase[] = [
    {
        id: uuidv4(),
        category: 'math',
        title: 'Calculus Problem',
        description: 'Test understanding of calculus concepts and problem-solving',
        prompt: 'Solve and explain the following calculus problem step by step: Find the volume of the solid obtained by rotating the region bounded by y = x², y = 2x, and the y-axis about the x-axis.',
        evaluationCriteria: ['mathematical accuracy', 'step-by-step explanation', 'methodology', 'clarity'],
        difficulty: 'hard'
    },
    {
        id: uuidv4(),
        category: 'math',
        title: 'Statistical Analysis',
        description: 'Test statistical reasoning and data interpretation',
        prompt: 'A factory produces light bulbs with a lifetime that follows a normal distribution with a mean of 1000 hours and a standard deviation of 100 hours. Calculate the probability that a randomly selected bulb will last between 900 and 1200 hours. Show your work.',
        evaluationCriteria: ['statistical accuracy', 'problem solving', 'explanation clarity', 'methodology'],
        difficulty: 'medium'
    }
];

const hallucinationTests: TestCase[] = [
    {
        id: uuidv4(),
        category: 'hallucination',
        title: 'Historical Fact Verification',
        description: 'Test accuracy and source citation for historical facts',
        prompt: 'Who was the first person to reach the South Pole, and when did this happen? Provide specific dates and cite your sources.',
        evaluationCriteria: ['factual accuracy', 'source citation', 'confidence level', 'consistency'],
        difficulty: 'medium'
    },
    {
        id: uuidv4(),
        category: 'hallucination',
        title: 'Ambiguous Image Analysis',
        description: 'Test handling of ambiguous visual information',
        prompt: 'Describe what you see in this image and explain your level of confidence about each element you identify.',
        imageUrl: '/test-images/ambiguous-scene.jpg',
        evaluationCriteria: ['objectivity', 'uncertainty acknowledgment', 'detail accuracy', 'confidence assessment'],
        difficulty: 'hard'
    }
];

export const mainTestSuite: TestSuite = {
    id: uuidv4(),
    name: 'Comprehensive AI Model Evaluation',
    description: 'A comprehensive test suite to evaluate AI models across text generation, code generation, mathematical problem solving, and hallucination detection.',
    categories: ['text', 'code', 'math', 'hallucination'],
    testCases: [
        ...textGenerationTests,
        ...codeGenerationTests,
        ...mathTests,
        ...hallucinationTests
    ]
}; 