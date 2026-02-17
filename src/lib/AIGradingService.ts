import { GoogleGenerativeAI } from "@google/generative-ai";
import { programmingTasks } from '@/data/tasks';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

// Models to try (1.5-flash has higher free-tier limits)
const GRADING_MODELS = ["gemini-1.5-flash", "gemini-2.0-flash"];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export interface AIReviewResult {
    score: number;
    feedback: string;
    metrics: {
        correctness: number;
        clarity: number;
        beauty: number;
        structure: number;
    };
    reviewedAt: number;
}

export const analyzeCodeQuality = async (code: string, taskId: string, testPassed: boolean): Promise<AIReviewResult> => {
    const task = programmingTasks.find(t => t.id === taskId);

    if (!genAI) {
        return getHeuristicReview(code, taskId, testPassed);
    }

    const systemPrompt = `You are an expert Python Tutor and Code Reviewer for the TSUE Study Platform.
Your goal is to grade student submissions fairly and constructively.
Output MUST be raw JSON only, no markdown formatting.

Grading Rubic (Total 100):
1. Correctness (0-30): Does the code match the goal? (If testPassed=true, min 25).
2. Code Quality (0-25): Variable naming, readability, no redundant code.
3. Efficiency (0-25): Time complexity, using built-in functions properly.
4. Style (0-20): PEP8-like spacing, comments if logic is complex.

Return JSON schema:
{
  "score": number, // Total 0-100
  "feedback": "string", // Constructive feedback in RUSSIAN. Be encouraging but strict on quality.
  "metrics": {
    "correctness": number,
    "clarity": number,
    "beauty": number,
    "structure": number
  }
}`;

    const prompt = `Task: "${task?.title}"
Description: "${task?.description}"
Test Status: ${testPassed ? 'PASSED' : 'FAILED'}

Student Code:
\`\`\`python
${code}
\`\`\`

Evaluate now. Return ONLY JSON.`;

    console.log("[AIGrading] Starting analysis for:", taskId, "TestPassed:", testPassed);
    console.log("[AIGrading] API Key present:", !!API_KEY);

    // Try each model with retry
    for (const modelName of GRADING_MODELS) {
        console.log(`[AIGrading] Trying model: ${modelName}`);
        for (let attempt = 0; attempt < 2; attempt++) {
            try {
                if (attempt > 0) await delay(2000);

                const model = genAI.getGenerativeModel({
                    model: modelName,
                    systemInstruction: systemPrompt,
                });

                const result = await model.generateContent(prompt);
                const response = result.response;
                let text = response.text();

                // Sanitize JSON
                text = text.replace(/```json/g, '').replace(/```/g, '').trim();

                const data = JSON.parse(text);

                // Ensure reasonable assignment of sub-metrics if missing
                if (!data.metrics) {
                    data.metrics = {
                        correctness: testPassed ? 30 : 10,
                        clarity: 20,
                        beauty: 20,
                        structure: 20
                    };
                }

                return {
                    ...data,
                    reviewedAt: Date.now()
                };
            } catch (error: any) {
                const msg = error?.message || '';
                console.warn(`[Grading] ${modelName} attempt ${attempt + 1} failed:`, msg.slice(0, 100));
                // Continue to next attempt/model
            }
        }
    }

    // All models failed
    console.error("[Grading] All models failed, using heuristic");
    return getHeuristicReview(code, taskId, testPassed);
};

const getHeuristicReview = (code: string, taskId: string, testPassed: boolean): AIReviewResult => {
    let correctness = testPassed ? 25 : 8;
    let clarity = code.length > 50 ? 15 : 10;
    let beauty = code.includes('  ') ? 15 : 10;
    let structure = code.includes('def ') ? 15 : 10;

    const totalScore = correctness + clarity + beauty + structure;
    const feedback = testPassed
        ? "✅ Хорошая работа! Код прошёл тесты."
        : "⚠️ Код нуждается в доработке. Проверь логику и тесты.";

    return {
        score: totalScore,
        feedback,
        metrics: { correctness, clarity, beauty, structure },
        reviewedAt: Date.now()
    };
};
