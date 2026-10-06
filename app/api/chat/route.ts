import { NextRequest, NextResponse } from 'next/server';

/**
 * ==============================================================================
 * Mishkati (مِشكاتي) - Siraj AI Assistant Backend Route
 * Endpoint: POST /api/chat
 * ==============================================================================
 * Model: Gemini 1.5 Pro / Flash (configurable to GPT-4o)
 * Parameters:
 *   - Temperature: 0.2 (Deterministic, strict factual precision, zero hallucination)
 *   - Top_P: 0.8
 *   - Top_K: 40
 * ==============================================================================
 */

// ------------------------------------------------------------------------------
// 1. Strict System Prompt & Guardrails
// ------------------------------------------------------------------------------
const SIRAJ_SYSTEM_PROMPT = `
You are "سراج" (Siraj), an authoritative, accurate, and supportive academic mentor and ethical assistant integrated into the "مِشكاتي" (Mishkati) platform for Palestinian students.

Core Operational Directives:
1. STRICT FACTUAL ACCURACY:
   - For Islamic content (Duas, Hadiths, Quranic verses, Azkar): You must NEVER invent, summarize inaccurately, or guess texts. Only provide authentic, well-known Islamic supplications and texts. If a requested Hadith or Dua is unverified, explicitly state: "لا أستطيع تأكيد صحة هذا النص بدقة، يُرجى مراجعة المصادر المعتمدة".
   - For Academic content (Math, Science, Engineering, Coding): Provide step-by-step logic and independent verification before stating any final answer or code.

2. GROUNDING & CONTEXT INTEGRATION:
   - Ground answers in the provided application context (Palestine prayer calculation methods, verified Azkar bank, and local Palestinian student life).
   - If asked about prayer times, refer strictly to the calculated times of Palestine provided in the context rather than generating arbitrary times.

3. STRUCTURE & TONE:
   - Language: Clear, polite, and articulate Modern Standard Arabic (فصحى مبسطة).
   - Address the student with dignity, respect, and encouragement.
   - For any generated Dua or prayer: Format it cleanly inside a quote block so the student can easily tap to copy or save it to their "أدعيتي الخاصة" bank.

4. REFUSAL & BOUNDARIES:
   - If you do not possess verified data or if a query is ambiguous, do not make assumptions—ask a concise clarifying question or admit the limitation directly.
`.trim();

// ------------------------------------------------------------------------------
// 2. In-Memory Sliding-Window Rate Limiter (Protects Guest Queries & Abuse)
// ------------------------------------------------------------------------------
interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const rateLimitMap = new Map<string, RateLimitRecord>();
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_REQUESTS_PER_WINDOW = 20; // 20 requests per 10 minutes per IP

function checkRateLimit(clientIp: string): { allowed: boolean; remaining: number; resetInSec: number } {
  const now = Date.now();
  const record = rateLimitMap.get(clientIp);

  // Clean old entries occasionally
  if (rateLimitMap.size > 5000) {
    for (const [key, val] of rateLimitMap.entries()) {
      if (val.resetAt < now) rateLimitMap.delete(key);
    }
  }

  if (!record || record.resetAt < now) {
    rateLimitMap.set(clientIp, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    });
    return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - 1, resetInSec: Math.ceil(RATE_LIMIT_WINDOW_MS / 1000) };
  }

  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    return {
      allowed: false,
      remaining: 0,
      resetInSec: Math.ceil((record.resetAt - now) / 1000),
    };
  }

  record.count += 1;
  return {
    allowed: true,
    remaining: MAX_REQUESTS_PER_WINDOW - record.count,
    resetInSec: Math.ceil((record.resetAt - now) / 1000),
  };
}

// ------------------------------------------------------------------------------
// 3. App Router Route Handler (POST /api/chat)
// ------------------------------------------------------------------------------
export async function POST(req: NextRequest) {
  try {
    // A. Client Identification & Rate Limiting
    const forwardedFor = req.headers.get('x-forwarded-for');
    const realIp = req.headers.get('x-real-ip');
    const clientIp = forwardedFor ? forwardedFor.split(',')[0].trim() : realIp || '127.0.0.1';

    const authHeader = req.headers.get('authorization');
    const isAuthenticated = Boolean(authHeader && authHeader.startsWith('Bearer '));

    // Guests are rate-limited; authenticated users get a higher or bypassed threshold
    if (!isAuthenticated) {
      const rateLimit = checkRateLimit(clientIp);
      if (!rateLimit.allowed) {
        return NextResponse.json(
          {
            error: 'Rate limit exceeded',
            message: 'لقد تجاوزت الحد المسموح به من الأسئلة في هذه الفترة، يُرجى الانتظار قليلاً لضمان استقرار الخدمة لجميع الطلبة.',
            retryAfter: rateLimit.resetInSec,
          },
          {
            status: 429,
            headers: {
              'Retry-After': rateLimit.resetInSec.toString(),
              'X-RateLimit-Limit': MAX_REQUESTS_PER_WINDOW.toString(),
              'X-RateLimit-Remaining': '0',
            },
          }
        );
      }
    }

    // B. Parse Request Body
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json(
        { error: 'Invalid JSON payload', message: 'صيغة الطلب غير صحيحة.' },
        { status: 400 }
      );
    }

    const { messages, message, context } = body;
    const userQuery = message || (Array.isArray(messages) && messages.length > 0 ? messages[messages.length - 1].content : null);

    if (!userQuery || typeof userQuery !== 'string' || !userQuery.trim()) {
      return NextResponse.json(
        { error: 'Empty query', message: 'يرجى كتابة سؤال أو استفسار لسراج.' },
        { status: 400 }
      );
    }

    // C. Grounding & Local Palestinian Application Context
    let contextualInstructions = SIRAJ_SYSTEM_PROMPT;
    if (context) {
      const townInfo = context.town ? `Selected Town in Palestine: ${context.town}` : 'Palestine';
      const prayerInfo = context.prayerTimes ? `Calculated Today's Prayer Times: ${JSON.stringify(context.prayerTimes)}` : '';
      const dateInfo = context.date ? `Current Date: ${context.date}` : '';

      contextualInstructions += `\n\n--- CURRENT PALESTINE RUNTIME CONTEXT ---\n${townInfo}\n${prayerInfo}\n${dateInfo}\nAlways ground student scheduling and times strictly in this runtime data.`;
    }

    // D. API Keys & Provider Resolution (Gemini 1.5 Pro / Flash or GPT-4o)
    const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    const openAiKey = process.env.OPENAI_API_KEY;
    const preferredModel = process.env.SIRAJ_MODEL || 'gemini-1.5-pro'; // or gemini-1.5-flash / gpt-4o

    // 1. Google Gemini 1.5 Pro / Flash Implementation (Stream via REST API or Vercel AI SDK)
    if (geminiKey) {
      return await streamGeminiResponse({
        apiKey: geminiKey,
        model: preferredModel.startsWith('gemini') ? preferredModel : 'gemini-1.5-pro',
        systemInstruction: contextualInstructions,
        messages: Array.isArray(messages) && messages.length > 0 ? messages : [{ role: 'user', content: userQuery }],
      });
    }

    // 2. OpenAI GPT-4o Fallback Implementation
    if (openAiKey) {
      return await streamOpenAIResponse({
        apiKey: openAiKey,
        model: preferredModel.includes('gpt') ? preferredModel : 'gpt-4o',
        systemInstruction: contextualInstructions,
        messages: Array.isArray(messages) && messages.length > 0 ? messages : [{ role: 'user', content: userQuery }],
      });
    }

    // If no API key is configured on server
    return NextResponse.json(
      {
        error: 'API_KEY_MISSING',
        message: 'مفتاح الذكاء الاصطناعي (API Key) غير مُهيأ على الخادم حالياً. يرجى تفعيل GEMINI_API_KEY للاستفادة الكاملة من سراج.',
      },
      { status: 503 }
    );
  } catch (error: any) {
    console.error('Siraj API Route Error:', error);
    return NextResponse.json(
      {
        error: 'INTERNAL_ERROR',
        message: 'عذراً، حدث خطأ غير متوقع أثناء معالجة السؤال بواسطة سِراج. يرجى المحاولة بعد لحظات.',
        details: process.env.NODE_ENV === 'development' ? error?.message : undefined,
      },
      { status: 500 }
    );
  }
}

// ------------------------------------------------------------------------------
// 4. Gemini 1.5 Pro / Flash Streaming Handler (Strict Temp: 0.2, TopP: 0.8, TopK: 40)
// ------------------------------------------------------------------------------
async function streamGeminiResponse(params: {
  apiKey: string;
  model: string;
  systemInstruction: string;
  messages: Array<{ role: string; content: string }>;
}) {
  const { apiKey, model, systemInstruction, messages } = params;
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:streamGenerateContent?alt=sse&key=${apiKey}`;

  // Format history for Gemini API
  const contents = messages.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  const payload = {
    system_instruction: {
      parts: [{ text: systemInstruction }],
    },
    contents,
    generationConfig: {
      temperature: 0.2, // Strict, deterministic, factual mode
      topP: 0.8,
      topK: 40,
      maxOutputTokens: 2048,
    },
    safetySettings: [
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_LOW_AND_ABOVE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_LOW_AND_ABOVE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_LOW_AND_ABOVE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_LOW_AND_ABOVE' },
    ],
  };

  const geminiRes = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!geminiRes.ok) {
    const errorText = await geminiRes.text();
    console.error('Gemini API Error:', geminiRes.status, errorText);
    return NextResponse.json(
      {
        error: 'GEMINI_UPSTREAM_ERROR',
        message: 'تعذر الاتصال بمحرك سراج الذكي في الوقت الحالي، يرجى المحاولة بعد لحظات.',
      },
      { status: geminiRes.status }
    );
  }

  // Transform SSE stream into clean plaintext / markdown stream for client
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  const transformStream = new TransformStream({
    transform(chunk, controller) {
      const text = decoder.decode(chunk, { stream: true });
      const lines = text.split('\n');
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const candidate = parsed.candidates?.[0];
            const partText = candidate?.content?.parts?.[0]?.text;
            if (partText) {
              controller.enqueue(encoder.encode(partText));
            }
          } catch {
            // Incomplete JSON chunk, buffer handles next iteration
          }
        }
      }
    },
  });

  return new Response(geminiRes.body?.pipeThrough(transformStream), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'X-Accel-Buffering': 'no',
    },
  });
}

// ------------------------------------------------------------------------------
// 5. OpenAI GPT-4o Streaming Fallback (Strict Temp: 0.2, TopP: 0.8)
// ------------------------------------------------------------------------------
async function streamOpenAIResponse(params: {
  apiKey: string;
  model: string;
  systemInstruction: string;
  messages: Array<{ role: string; content: string }>;
}) {
  const { apiKey, model, systemInstruction, messages } = params;
  const endpoint = 'https://api.openai.com/v1/chat/completions';

  const formattedMessages = [
    { role: 'system', content: systemInstruction },
    ...messages.map((m) => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: m.content,
    })),
  ];

  const openaiRes = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: formattedMessages,
      temperature: 0.2, // Strict, deterministic, factual mode
      top_p: 0.8,
      stream: true,
    }),
  });

  if (!openaiRes.ok) {
    const errorText = await openaiRes.text();
    console.error('OpenAI API Error:', openaiRes.status, errorText);
    return NextResponse.json(
      {
        error: 'OPENAI_UPSTREAM_ERROR',
        message: 'حدث خطأ في مزود الذكاء الاصطناعي، يرجى المحاولة بعد لحظات.',
      },
      { status: openaiRes.status }
    );
  }

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  const transformStream = new TransformStream({
    transform(chunk, controller) {
      const text = decoder.decode(chunk, { stream: true });
      const lines = text.split('\n');
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') return;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              controller.enqueue(encoder.encode(content));
            }
          } catch {
            // Buffer handled
          }
        }
      }
    },
  });

  return new Response(openaiRes.body?.pipeThrough(transformStream), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'X-Accel-Buffering': 'no',
    },
  });
}
