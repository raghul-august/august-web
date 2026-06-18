import 'server-only';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function generateWithGemini(prompt) {
  const model = genAI.getGenerativeModel({
    model: process.env.GEMINI_MODEL,
    generationConfig: {
      responseMimeType: "application/json",
    }
  });

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  // Gemini sometimes returns extra text or malformed JSON — try multiple extraction strategies
  try {
    return JSON.parse(text);
  } catch {
    // Strategy 1: find the first complete JSON object by matching braces
    const start = text.indexOf('{');
    if (start === -1) throw new Error('No valid JSON found in Gemini response');

    let depth = 0;
    let inString = false;
    let escape = false;
    let end = -1;

    for (let i = start; i < text.length; i++) {
      const ch = text[i];
      if (escape) { escape = false; continue; }
      if (ch === '\\') { escape = true; continue; }
      if (ch === '"') { inString = !inString; continue; }
      if (inString) continue;
      if (ch === '{') depth++;
      if (ch === '}') { depth--; if (depth === 0) { end = i; break; } }
    }

    if (end === -1) throw new Error('No valid JSON found in Gemini response');
    return JSON.parse(text.substring(start, end + 1));
  }
}
