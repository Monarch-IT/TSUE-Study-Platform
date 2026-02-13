import { GoogleGenerativeAI } from "@google/generative-ai";
import { programmingTasks } from '@/data/tasks';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

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

    try {
        const model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash",
            systemInstruction: `Ты — AI Code Reviewer для TSUE Study Platform.
Анализируй код Python и давай объективную оценку.

Критерии (сумма 0-100):
1. Правильность (0-30): Работает ли код? Тесты проходят?
2. Качество (0-25): Чистота, именование переменных.
3. Эффективность (0-25): Оптимальный ли алгоритм?
4. Стиль (0-20): PEP8, читаемость.

ОБЯЗАТЕЛЬНО верни ответ ТОЛЬКО в JSON:
{
  "score": число,
  "feedback": "отзыв на русском",
  "metrics": { "correctness": 0-30, "clarity": 0-25, "beauty": 0-25, "structure": 0-20 }
}`,
            generationConfig: {
                temperature: 0.2,
                responseMimeType: "application/json",
            },
        });

        const prompt = `Задание: "${task?.title}"
Описание: "${task?.description}"
Результат тестов: ${testPassed ? 'УСПЕШНО' : 'ОШИБКА'}

Код:
\`\`\`python
${code}
\`\`\``;

        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const data = JSON.parse(text);
        return {
            ...data,
            reviewedAt: Date.now()
        };
    } catch (error) {
        console.error("AI Grading Error:", error);
        return getHeuristicReview(code, taskId, testPassed);
    }
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
