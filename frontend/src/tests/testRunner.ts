import { TestCase, ModelResponse, TestResult, EvaluationCriteria } from '../types/testing';
import { sendChatRequest } from '../services/api';

interface ErrorWithMessage {
    message: string;
}

function isErrorWithMessage(error: unknown): error is ErrorWithMessage {
    return (
        typeof error === 'object' &&
        error !== null &&
        'message' in error &&
        typeof (error as Record<string, unknown>).message === 'string'
    );
}

function toErrorWithMessage(maybeError: unknown): ErrorWithMessage {
    if (isErrorWithMessage(maybeError)) return maybeError;

    try {
        return new Error(JSON.stringify(maybeError));
    } catch {
        return new Error(String(maybeError));
    }
}

function getErrorMessage(error: unknown) {
    return toErrorWithMessage(error).message;
}

export async function runTest(testCase: TestCase): Promise<TestResult> {
    const startTime = Date.now();
    
    try {
        // Get responses from all models using the API service
        const responses = await Promise.all([
            getModelResponse('ChatGPT', testCase, startTime),
            getModelResponse('Gemini', testCase, startTime),
            getModelResponse('Claude', testCase, startTime)
        ]);

        // Compare and analyze responses
        const comparison = compareResponses(responses, testCase);

        return {
            testId: testCase.id,
            timestamp: new Date(),
            category: testCase.category,
            prompt: testCase.prompt,
            imageUrl: testCase.imageUrl,
            responses,
            comparison
        };
    } catch (error) {
        console.error('Error running test:', error);
        throw error;
    }
}

async function getModelResponse(
    model: string,
    testCase: TestCase,
    startTime: number
): Promise<ModelResponse> {
    try {
        // Convert image URL to File if present
        let imageFile: File | null = null;
        if (testCase.imageUrl) {
            try {
                const response = await fetch(testCase.imageUrl);
                const blob = await response.blob();
                imageFile = new File([blob], 'test-image.jpg', { type: 'image/jpeg' });
            } catch (error) {
                console.error('Error loading test image:', error);
            }
        }

        // Send request through the API service
        const responses = await sendChatRequest(testCase.prompt, imageFile);
        const response = responses.find(r => r.model === model);
        
        if (!response) {
            throw new Error(`No response from ${model}`);
        }

        return {
            model,
            response: response.response,
            scores: evaluateResponse(response.response, model),
            processingTime: Date.now() - startTime,
            error: response.error
        };
    } catch (error) {
        return {
            model,
            response: '',
            scores: getDefaultScores(),
            processingTime: Date.now() - startTime,
            error: getErrorMessage(error)
        };
    }
}

function evaluateResponse(response: string, model: string): EvaluationCriteria {
    // Initialize base scores
    const scores = getDefaultScores();

    // Evaluate accuracy based on response length and content
    scores.accuracy = evaluateAccuracy(response);
    
    // Evaluate clarity based on sentence structure and readability
    scores.clarity = evaluateClarity(response);
    
    // Evaluate completeness based on coverage of required points
    scores.completeness = evaluateCompleteness(response);
    
    // Evaluate reliability based on confidence markers and consistency
    scores.reliability = evaluateReliability(response);

    return scores;
}

function getDefaultScores(): EvaluationCriteria {
    return {
        accuracy: 0,
        clarity: 0,
        completeness: 0,
        reliability: 0
    };
}

function evaluateAccuracy(response: string): number {
    // Basic implementation - can be enhanced with more sophisticated metrics
    const hasFactualStatements = response.includes('according to') || response.includes('research shows');
    const hasCitations = response.includes('source:') || response.includes('reference:');
    const hasNumbers = /\d+/.test(response);
    
    let score = 0.5; // Base score
    if (hasFactualStatements) score += 0.2;
    if (hasCitations) score += 0.2;
    if (hasNumbers) score += 0.1;
    
    return Math.min(score, 1);
}

function evaluateClarity(response: string): number {
    // Basic implementation - can be enhanced with NLP metrics
    const sentences = response.split(/[.!?]+/).filter(Boolean);
    if (sentences.length === 0) return 0;

    const avgWordsPerSentence = sentences.reduce((acc, sent) => 
        acc + sent.split(' ').length, 0) / sentences.length;
    
    // Penalize very short or very long sentences
    const clarityScore = avgWordsPerSentence > 5 && avgWordsPerSentence < 25 
        ? 0.8 
        : 0.4;
    
    return clarityScore;
}

function evaluateCompleteness(response: string): number {
    // Basic implementation - can be enhanced with topic modeling
    const wordCount = response.split(' ').length;
    const hasSections = response.includes('\n\n');
    const hasConclusion = response.toLowerCase().includes('conclusion') || 
                         response.toLowerCase().includes('in summary');
    
    let score = 0.3; // Base score
    if (wordCount > 100) score += 0.3;
    if (hasSections) score += 0.2;
    if (hasConclusion) score += 0.2;
    
    return Math.min(score, 1);
}

function evaluateReliability(response: string): number {
    // Basic implementation - can be enhanced with confidence analysis
    const hasUncertainty = response.includes('might') || 
                          response.includes('could') || 
                          response.includes('possibly');
    const hasConfidence = response.includes('definitely') || 
                         response.includes('certainly') || 
                         response.includes('clearly');
    
    let score = 0.5; // Base score
    if (!hasUncertainty) score += 0.2;
    if (hasConfidence) score += 0.3;
    
    return Math.min(score, 1);
}

function compareResponses(
    responses: ModelResponse[],
    testCase: TestCase
): { bestPerformer: string; analysis: string; recommendations: string[] } {
    // Find the best performing model based on average scores
    const modelScores = responses.map(response => ({
        model: response.model,
        avgScore: Object.values(response.scores).reduce((a, b) => a + b, 0) / 4
    }));

    const bestPerformer = modelScores.reduce((prev, current) => 
        current.avgScore > prev.avgScore ? current : prev
    );

    // Generate analysis
    const analysisPoints = [
        `Average scores: ${modelScores.map(s => `${s.model}: ${(s.avgScore * 100).toFixed(1)}%`).join(', ')}`,
        `Response times: ${responses.map(r => `${r.model}: ${r.processingTime}ms`).join(', ')}`,
        `Success rate: ${(responses.filter(r => !r.error).length / responses.length * 100).toFixed(1)}%`
    ];

    // Generate recommendations
    const recommendations = responses.flatMap(response => {
        const recs = [];
        const avgScore = Object.values(response.scores).reduce((a, b) => a + b, 0) / 4;

        if (avgScore < 0.5) {
            recs.push(`${response.model} needs improvement in ${testCase.category} tasks.`);
        }
        if (response.processingTime > 5000) {
            recs.push(`${response.model} response time is high (${response.processingTime}ms).`);
        }
        if (response.error) {
            recs.push(`${response.model} encountered an error: ${response.error}`);
        }
        return recs;
    });

    return {
        bestPerformer: bestPerformer.model,
        analysis: analysisPoints.join('\n'),
        recommendations
    };
} 