/**
 * Gemini 2.5 Flash via @google/genai.
 * Env: GEMINI_API_KEY. If missing or the call fails, callers use canned fallback.
 */

import { GoogleGenAI } from '@google/genai';

export const GEMINI_MODEL = 'gemini-2.5-flash';

export class GeminiUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GeminiUnavailableError';
  }
}

export function isGeminiConfigured(): boolean {
  return Boolean((process.env.GEMINI_API_KEY || '').trim());
}

export async function generateGeminiText(prompt: string, systemInstruction?: string): Promise<string> {
  const apiKey = (process.env.GEMINI_API_KEY || '').trim();
  if (!apiKey) {
    throw new GeminiUnavailableError('GEMINI_API_KEY is not set');
  }

  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: prompt,
    config: systemInstruction ? { systemInstruction } : undefined,
  });

  const text = response.text?.trim();
  if (!text) {
    throw new GeminiUnavailableError('Gemini returned an empty response');
  }
  return text;
}

export function parseJsonObject(text: string): Record<string, unknown> {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) {
    throw new Error('No JSON object in model output');
  }
  return JSON.parse(match[0]) as Record<string, unknown>;
}
