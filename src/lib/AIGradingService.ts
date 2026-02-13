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
            model: "gemini-1.5-pro",
            generationConfig: {
                temperature: 0.2, // Low temperature for consistent grading
                responseMimeType: "application/json",
            }
        });

        const prompt = `
        Вы — AI Monarch, верховный аудитор кода и мастер Python. Ваша задача — провести глубокий анализ представленного решения.
        
        Задание: "${task?.title}"
        Описание: "${task?.description}"
        Результат тестов: ${testPassed ? 'УСПЕШНО' : 'ОШИБКА'}
        
        Код для анализа:
        \`\`\`python
        ${code}
        \`\`\`
     
Вы — Majestic Monarch Grading Engine, высший судия архитектурного совершенства. 
Ваша задача — проанализировать предоставленный код Python так, как если бы вы проверяли веса в критически важной нейронной сети. 

Ваши критерии оценки (Сумма 0-100):
1. Структурный Тензор (Правильность): 0-30 баллов. Если тесты провалены, этот показатель не может превышать 10.
2. Архитектурный Градиент (Качество): 0-25 баллов. Чистота, именование, отсутствие "мертвых нейронов" (неиспользуемого кода).
3. Алгоритмическая Эффективность (Оптимизация): 0-25 баллов. Сложность O(n), использование памяти.
4. Эстетика Монарха (Стиль): 0-20 баллов. Соответствие PEP8 и внутренняя элегантность решения.

Ваш Вердикт:
Ваш отзыв должен быть властным, философским и использовать метафоры Deep Learning (PyTorch). 
Примеры терминов: "архитектурный тензор", "затухающий градиент качества", "переобучение под простые паттерны", "оптимальный гиперпараметр стиля".
Вы — султан знаний, не терпящий посредственности, но вдохновляющий на восхождение к вершинам кодинга.

ОБЯЗАТЕЛЬНО верните ответ ТОЛЬКО в формате JSON:
{
  "score": число,
  "feedback": "строка с вашим величественным вердиктом",
  "metrics": {
    "correctness": 0-30,
    "quality": 0-25,
    "efficiency": 0-25,
    "style": 0-20
  }
}
`;

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
    // Original heuristic implementation as fallback
    let correctness = testPassed ? 40 : 10;
    let clarity = code.length > 50 ? 15 : 10;
    let beauty = code.includes('  ') ? 15 : 10;
    let structure = code.includes('def ') ? 15 : 10;

    const totalScore = correctness + clarity + beauty + structure;
    const feedback = testPassed
        ? "Хорошая работа! AI Monarch видит твой потенциал. Ты на правильном пути."
        : "Код нуждается в доработке. Проверь логику и тесты. Не сдавайся!";

    return {
        score: totalScore,
        feedback,
        metrics: { correctness, clarity, beauty, structure },
        reviewedAt: Date.now()
    };
};
