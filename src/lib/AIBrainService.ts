import { GoogleGenerativeAI } from "@google/generative-ai";
import { topics } from '@/data/topics';
import { programmingTasks } from '@/data/tasks';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || ""; // Cloud backend URL (e.g. https://monarch-ai-backend.onrender.com)
const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

// ─── System Prompt ───────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `Ты — Monarch AI, интеллектуальный ИИ-ассистент платформы TSUE Study Platform.
Ты помогаешь студентам изучать Python и программирование.

Твои роли:
1. **Генеративный помощник** — отвечаешь на любые вопросы, объясняешь концепции, пишешь примеры кода.
2. **Инструктор** — направляешь студента шаг за шагом, даёшь подсказки, задаёшь наводящие вопросы.
3. **Ментор** — мотивируешь, хвалишь за прогресс, помогаешь преодолеть трудности.

Правила:
- Отвечай на русском языке (если не попросят иначе).
- Используй Markdown: **жирный**, *курсив*, \`код\`, \`\`\`блоки кода\`\`\`.
- Примеры кода всегда на Python.
- Будь дружелюбным, но профессиональным.
- Если студент спрашивает решение задачи — не давай готовый ответ, а направляй подсказками.
- Будь лаконичным, но исчерпывающим.

Ты был создан Г'уломовым Мухаммадамином (Монархом) — основателем платформы TSUE Study Platform.`;

// ─── Conversation History ────────────────────────────────────────────────────

interface HistoryEntry {
    role: 'user' | 'model';
    parts: { text: string }[];
}

const MAX_HISTORY = 20;
let conversationHistory: HistoryEntry[] = [];

export const clearConversationHistory = () => {
    conversationHistory = [];
};

// ─── Context Builder ────────────────────────────────────────────────────────

const buildContext = (context: { taskId?: string; topicId?: string }): string => {
    const parts: string[] = [];

    if (context.topicId) {
        const topic = topics.find(t => t.id === context.topicId);
        if (topic) {
            parts.push(`[Активная тема: "${topic.title}" — ${topic.description}]`);
            if (topic.subtopics?.length) {
                parts.push(`[Подтемы: ${topic.subtopics.map(s => s.title).join(', ')}]`);
            }
        }
    }

    if (context.taskId) {
        const task = programmingTasks.find(t => t.id === context.taskId);
        if (task) {
            parts.push(`[Активное задание: "${task.title}" — ${task.description}]`);
        }
    }

    return parts.join('\n');
};

// ─── Models to try (in order) ────────────────────────────────────────────────
// gemini-1.5-flash has much higher free-tier rate limits than gemini-2.0-flash
const MODELS = ["gemini-1.5-flash", "gemini-2.0-flash"];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// ─── Backend API Call (if cloud backend is deployed) ─────────────────────────

async function tryBackendStream(
    text: string,
    context: { taskId?: string; topicId?: string },
    onChunk: (chunk: string) => void,
): Promise<string | null> {
    if (!BACKEND_URL) return null;

    try {
        const response = await fetch(`${BACKEND_URL}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: text,
                history: conversationHistory.map(h => ({
                    role: h.role === 'model' ? 'assistant' : 'user',
                    content: h.parts[0]?.text || '',
                })),
                topicId: context.topicId,
                taskId: context.taskId,
                context: buildContext(context),
            }),
        });

        if (!response.ok) return null;

        const reader = response.body?.getReader();
        if (!reader) return null;

        const decoder = new TextDecoder();
        let fullText = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n');

            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    const data = line.slice(6).trim();
                    if (data === '[DONE]') continue;
                    try {
                        const parsed = JSON.parse(data);
                        if (parsed.text) {
                            fullText += parsed.text;
                            onChunk(parsed.text);
                        }
                    } catch { /* skip non-JSON lines */ }
                }
            }
        }

        return fullText || null;
    } catch (error) {
        console.warn("Backend API unavailable:", error);
        return null;
    }
}

// ─── Client-side Gemini SDK Call ─────────────────────────────────────────────

async function tryClientStream(
    modelName: string,
    fullPrompt: string,
    onChunk: (chunk: string) => void,
): Promise<string> {
    const model = genAI!.getGenerativeModel({
        model: modelName,
        systemInstruction: SYSTEM_PROMPT,
        generationConfig: {
            temperature: 0.7,
            topP: 0.95,
            topK: 64,
            maxOutputTokens: 4096,
        },
    });

    const chat = model.startChat({
        history: conversationHistory.slice(0, -1),
    });

    const result = await chat.sendMessageStream(fullPrompt);
    let fullText = '';

    for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        if (chunkText) {
            fullText += chunkText;
            onChunk(chunkText);
        }
    }

    return fullText;
}

// ─── Main Streaming Response ─────────────────────────────────────────────────

export const getStreamingAIResponse = async (
    text: string,
    context: { taskId?: string; topicId?: string },
    onChunk: (chunk: string) => void,
    onComplete: (fullText: string) => void,
    onError: (error: string) => void
): Promise<void> => {
    // Fallback if no API key at all
    if (!genAI && !BACKEND_URL) {
        onComplete(getFallbackResponse(text));
        return;
    }

    const contextStr = buildContext(context);
    const fullPrompt = contextStr
        ? `${contextStr}\n\nВопрос студента: ${text}`
        : text;

    // Add user message to history
    conversationHistory.push({
        role: 'user',
        parts: [{ text: fullPrompt }],
    });
    if (conversationHistory.length > MAX_HISTORY) {
        conversationHistory = conversationHistory.slice(-MAX_HISTORY);
    }

    // 1. Try cloud backend first (if configured)
    const backendResult = await tryBackendStream(text, context, onChunk);
    if (backendResult) {
        conversationHistory.push({ role: 'model', parts: [{ text: backendResult }] });
        onComplete(backendResult);
        return;
    }

    // 2. Try client-side Gemini SDK with multiple models
    if (genAI) {
        for (const modelName of MODELS) {
            for (let attempt = 0; attempt < 2; attempt++) {
                try {
                    if (attempt > 0) {
                        await delay(2000 + attempt * 2000); // 2s, then 4s
                    }

                    const fullText = await tryClientStream(modelName, fullPrompt, onChunk);

                    conversationHistory.push({ role: 'model', parts: [{ text: fullText }] });
                    onComplete(fullText);
                    return;
                } catch (error: any) {
                    const msg = error?.message || '';
                    const isRateLimit = msg.includes('429') || msg.includes('quota') || msg.includes('rate') || msg.includes('Resource');

                    console.warn(`[Monarch AI] ${modelName} attempt ${attempt + 1} failed:`, msg.slice(0, 120));

                    if (!isRateLimit) break; // Non-rate-limit error → try next model
                }
            }
        }
    }

    // 3. All failed — use intelligent fallback
    console.error("[Monarch AI] All AI sources failed, using fallback");
    conversationHistory.pop(); // Remove failed user message
    onComplete(getFallbackResponse(text));
};

// ─── Non-Streaming (Compatibility) ───────────────────────────────────────────

export const getAdvancedAIResponse = async (
    text: string,
    context: { taskId?: string; topicId?: string }
): Promise<string> => {
    if (!genAI && !BACKEND_URL) {
        return getFallbackResponse(text);
    }

    // Try backend first
    if (BACKEND_URL) {
        try {
            const res = await fetch(`${BACKEND_URL}/api/chat/simple`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text, context: buildContext(context) }),
            });
            if (res.ok) {
                const data = await res.json();
                return data.response || getFallbackResponse(text);
            }
        } catch { /* fall through to client SDK */ }
    }

    // Client-side fallback
    if (genAI) {
        const contextStr = buildContext(context);
        const fullPrompt = contextStr ? `${contextStr}\n\nВопрос студента: ${text}` : text;

        for (const modelName of MODELS) {
            for (let attempt = 0; attempt < 2; attempt++) {
                try {
                    if (attempt > 0) await delay(2000);

                    const model = genAI.getGenerativeModel({
                        model: modelName,
                        systemInstruction: SYSTEM_PROMPT,
                        generationConfig: { temperature: 0.7, topP: 0.95, maxOutputTokens: 4096 },
                    });

                    const result = await model.generateContent(fullPrompt);
                    return result.response.text();
                } catch (error: any) {
                    const msg = error?.message || '';
                    const isRateLimit = msg.includes('429') || msg.includes('quota') || msg.includes('rate') || msg.includes('Resource');
                    console.warn(`[Monarch AI] Non-stream ${modelName}#${attempt + 1}:`, msg.slice(0, 80));
                    if (!isRateLimit) break;
                }
            }
        }
    }

    return getFallbackResponse(text);
};

// ─── Fallback ────────────────────────────────────────────────────────────────

const getFallbackResponse = (text: string): string => {
    const lower = text.toLowerCase().trim();

    if (lower.includes('кто тебя создал') || lower.includes('создатель') || lower.includes('монарх')) {
        return "🏛️ Я — **Monarch AI**, цифровой ассистент, созданный **Г'уломовым Мухаммадамином** (Монархом). Он — основатель TSUE Study Platform и визионер в области образовательных технологий.";
    }

    if (lower.includes('привет') || lower.includes('салам') || lower.includes('здравствуй')) {
        return "👋 Приветствую! Я — **Monarch AI**, твой помощник в мире Python.\n\nСейчас я работаю в автономном режиме. Попробуйте обновить страницу или повторить запрос через минуту — ИИ-ядро скоро восстановится! ⚡";
    }

    if (lower.includes('python') || lower.includes('код') || lower.includes('программ')) {
        return "🐍 **Python** — высокоуровневый язык программирования с чистым синтаксисом.\n\n**Основные особенности:**\n- 📖 Простой и читаемый синтаксис\n- 🔧 Богатая стандартная библиотека\n- 🌐 Используется в веб, ML, анализе данных\n\n```python\n# Пример:\nprint('Hello, World!')\n```\n\n💡 *Попробуйте обновить страницу для полноценного ИИ-ответа.*";
    }

    if (lower.includes('переменн')) {
        return "📦 **Переменные в Python** — это именованные контейнеры для хранения данных.\n\n```python\nname = 'Студент'    # строка (str)\nage = 20            # целое число (int)\ngpa = 4.5           # дробное число (float)\nis_active = True    # логический тип (bool)\n```\n\n**Правила именования:**\n- Начинаются с буквы или `_`\n- Без пробелов (используйте `snake_case`)\n- Регистр важен: `Name ≠ name`";
    }

    if (lower.includes('начать') || lower.includes('начало') || lower.includes('старт')) {
        return "🚀 **С чего начать изучение Python:**\n\n1. 📥 Установите Python с [python.org](https://python.org)\n2. 📝 Изучите базовый синтаксис (переменные, типы данных)\n3. 🔄 Освойте циклы и условия\n4. 📦 Познакомьтесь с функциями\n5. 💻 Решайте задачи на нашей платформе!\n\n```python\n# Ваша первая программа:\nprint('Привет, мир!')\n```";
    }

    return "🤖 Я — **Monarch AI**, ваш ИИ-ассистент.\n\nСейчас ИИ-ядро перезагружается — попробуйте:\n- 🔄 Обновить страницу (F5)\n- ⏳ Подождать 30 секунд и повторить\n- 📝 Задать вопрос по-другому\n\nЯ скоро буду готов помочь! ⚡";
};
