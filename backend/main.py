"""
Monarch AI Backend — FastAPI server for the TSUE Study Platform
Provides AI chat (streaming SSE) and code grading endpoints using Google Gemini.
"""

import os
import json
import asyncio
from typing import Optional, List, Dict

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from dotenv import load_dotenv

import google.generativeai as genai

# Load environment
load_dotenv()
API_KEY = os.getenv("GEMINI_API_KEY", "")

if API_KEY:
    genai.configure(api_key=API_KEY)

# ─── App Setup ────────────────────────────────────────────────────────────────

app = FastAPI(title="Monarch AI", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict to your domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── System Prompts ──────────────────────────────────────────────────────────

CHAT_SYSTEM_PROMPT = """Ты — Monarch AI, интеллектуальный ИИ-ассистент платформы TSUE Study Platform.
Ты помогаешь студентам изучать Python и программирование.

Твои роли:
1. **Генеративный помощник** — отвечаешь на любые вопросы, объясняешь концепции, пишешь примеры кода.
2. **Инструктор** — направляешь студента шаг за шагом, даёшь подсказки, задаёшь наводящие вопросы.
3. **Ментор** — мотивируешь, хвалишь за прогресс, помогаешь преодолеть трудности.

Правила:
- Отвечай на русском языке (если не попросят иначе).
- Используй Markdown для форматирования: **жирный**, *курсив*, `код`, ```блоки кода```.
- Примеры кода всегда на Python.
- Будь дружелюбным, но профессиональным.
- Если студент спрашивает решение задачи — не давай готовый ответ, а направляй подсказками.
- Если контекст содержит информацию о теме/задании — используй её для более точного ответа.
- Будь лаконичным, но исчерпывающим.

Ты был создан Г'уломовым Мухаммадамином (Монархом) — основателем платформы."""

GRADING_SYSTEM_PROMPT = """Ты — AI Code Reviewer для платформы TSUE Study Platform.
Твоя задача — анализировать код Python и давать объективную оценку.

Критерии оценки (сумма 0-100):
1. Правильность (0-30): Код работает, тесты проходят.
2. Качество кода (0-25): Чистота, именование переменных, нет лишнего кода.
3. Эффективность (0-25): Оптимальный алгоритм, правильная сложность.
4. Стиль (0-20): PEP8, консистентность, читаемость.

ОБЯЗАТЕЛЬНО верни ответ ТОЛЬКО в формате JSON:
{
  "score": число,
  "feedback": "строка с отзывом на русском языке",
  "metrics": {
    "correctness": 0-30,
    "quality": 0-25,
    "efficiency": 0-25,
    "style": 0-20
  }
}"""


# ─── Models ──────────────────────────────────────────────────────────────────

class ChatMessage(BaseModel):
    role: str  # 'user' or 'assistant'
    content: str


class ChatRequest(BaseModel):
    message: str
    history: List[ChatMessage] = []
    context: Optional[str] = None  # Active topic/task info
    topicId: Optional[str] = None
    taskId: Optional[str] = None


class GradeRequest(BaseModel):
    code: str
    taskId: str
    taskTitle: str = ""
    taskDescription: str = ""
    testPassed: bool = False


# ─── Endpoints ───────────────────────────────────────────────────────────────

@app.get("/api/health")
async def health():
    return {
        "status": "ok",
        "ai_ready": bool(API_KEY),
        "model": "gemini-2.0-flash" if API_KEY else None,
    }


@app.post("/api/chat")
async def chat(request: ChatRequest):
    """Streaming chat endpoint using Server-Sent Events (SSE)."""
    if not API_KEY:
        return {"response": "API ключ не настроен. Monarch AI временно недоступен."}

    try:
        model = genai.GenerativeModel(
            model_name="gemini-2.0-flash",
            system_instruction=CHAT_SYSTEM_PROMPT,
            generation_config=genai.GenerationConfig(
                temperature=0.7,
                top_p=0.95,
                top_k=64,
                max_output_tokens=4096,
            ),
        )

        # Build conversation history for context
        gemini_history = []
        for msg in request.history[-10:]:  # Last 10 messages for context
            gemini_history.append({
                "role": "user" if msg.role == "user" else "model",
                "parts": [msg.content],
            })

        chat_session = model.start_chat(history=gemini_history)

        # Build the prompt with context
        prompt_parts = []
        if request.context:
            prompt_parts.append(f"[Контекст: {request.context}]")
        if request.topicId:
            prompt_parts.append(f"[Текущая тема: {request.topicId}]")
        if request.taskId:
            prompt_parts.append(f"[Текущее задание: {request.taskId}]")
        prompt_parts.append(request.message)
        full_prompt = "\n".join(prompt_parts)

        # Stream the response
        async def generate_stream():
            try:
                response = chat_session.send_message(full_prompt, stream=True)
                for chunk in response:
                    if chunk.text:
                        # SSE format
                        data = json.dumps({"text": chunk.text}, ensure_ascii=False)
                        yield f"data: {data}\n\n"
                yield "data: [DONE]\n\n"
            except Exception as e:
                error_data = json.dumps({"error": str(e)}, ensure_ascii=False)
                yield f"data: {error_data}\n\n"
                yield "data: [DONE]\n\n"

        return StreamingResponse(
            generate_stream(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no",
            },
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/chat/simple")
async def chat_simple(request: ChatRequest):
    """Non-streaming chat endpoint (fallback for environments without SSE)."""
    if not API_KEY:
        return {"response": "API ключ не настроен. Monarch AI временно недоступен."}

    try:
        model = genai.GenerativeModel(
            model_name="gemini-2.0-flash",
            system_instruction=CHAT_SYSTEM_PROMPT,
            generation_config=genai.GenerationConfig(
                temperature=0.7,
                top_p=0.95,
                max_output_tokens=4096,
            ),
        )

        gemini_history = []
        for msg in request.history[-10:]:
            gemini_history.append({
                "role": "user" if msg.role == "user" else "model",
                "parts": [msg.content],
            })

        chat_session = model.start_chat(history=gemini_history)

        prompt_parts = []
        if request.context:
            prompt_parts.append(f"[Контекст: {request.context}]")
        prompt_parts.append(request.message)

        response = chat_session.send_message("\n".join(prompt_parts))
        return {"response": response.text}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/grade")
async def grade(request: GradeRequest):
    """Code grading endpoint — returns structured JSON review."""
    if not API_KEY:
        return get_heuristic_review(request.code, request.testPassed)

    try:
        model = genai.GenerativeModel(
            model_name="gemini-2.0-flash",
            system_instruction=GRADING_SYSTEM_PROMPT,
            generation_config=genai.GenerationConfig(
                temperature=0.2,
                response_mime_type="application/json",
            ),
        )

        prompt = f"""Задание: "{request.taskTitle}"
Описание: "{request.taskDescription}"
Результат тестов: {'УСПЕШНО' if request.testPassed else 'ОШИБКА'}

Код для анализа:
```python
{request.code}
```

Проанализируй код и верни JSON с оценкой."""

        response = model.generate_content(prompt)
        result = json.loads(response.text)
        result["reviewedAt"] = int(asyncio.get_event_loop().time() * 1000)
        return result

    except Exception as e:
        print(f"Grading error: {e}")
        return get_heuristic_review(request.code, request.testPassed)


def get_heuristic_review(code: str, test_passed: bool) -> dict:
    """Fallback heuristic review when AI is unavailable."""
    correctness = 25 if test_passed else 8
    quality = 15 if len(code) > 50 else 10
    efficiency = 15 if "for" in code or "while" in code else 10
    style = 15 if "def " in code else 10

    total = correctness + quality + efficiency + style
    feedback = (
        "Хорошая работа! Код прошёл тесты и выглядит достойно."
        if test_passed
        else "Код нуждается в доработке. Проверь логику и тесты."
    )

    return {
        "score": total,
        "feedback": feedback,
        "metrics": {
            "correctness": correctness,
            "quality": quality,
            "efficiency": efficiency,
            "style": style,
        },
        "reviewedAt": 0,
    }


# ─── Run ─────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
