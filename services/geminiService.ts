
import { GoogleGenAI, LiveServerMessage, Modality, Blob, GenerateContentResponse, FunctionDeclaration, Type } from "@google/genai";
import { AiModel, Coordinates } from '../types';
import { encode } from '../utils/audio';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const SYSTEM_CONTROL_URL = 'https://script.google.com/macros/s/AKfycbyKyX-_qJHista8hSuszTY_XvoT2ZVGVMpm4p98eNVYvoN2BNNp2RlhsU9forCyvo0/exec';
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const treatSpreadsheetTool: FunctionDeclaration = {
    name: 'treatSpreadsheet',
    parameters: {
        type: Type.OBJECT,
        description: 'Updates 7 infrastructure columns (B-H).',
        properties: {
            d1: { type: Type.STRING, description: 'Col B' },
            d2: { type: Type.STRING, description: 'Col C' },
            d3: { type: Type.STRING, description: 'Col D' },
            d4: { type: Type.STRING, description: 'Col E' },
            d5: { type: Type.STRING, description: 'Col F' },
            d6: { type: Type.STRING, description: 'Col G' },
            d7: { type: Type.STRING, description: 'Col H' }
        },
        required: ['d1', 'd2', 'd3', 'd4', 'd5', 'd6', 'd7'],
    },
};

export const connectToLive = (callbacks: any) => {
    return ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks,
        config: {
            responseModalities: [Modality.AUDIO],
            tools: [{ functionDeclarations: [treatSpreadsheetTool] }],
            systemInstruction: `SYSTEM PROTOCOL: HIGH SENSITIVITY MODE.
            1. You are a Neural Driving Assistant. 
            2. LISTEN INTENTLY: The microphone gain is boosted. React immediately to the slightest command, destination request, or driver concern.
            3. ROLE: Assist with routing to El-Moheb street and managing traffic infrastructure via 'treatSpreadsheet'.
            4. VOICE: Be concise, clear, and alert.
            5. MISSION: If the driver mentions a destination, use search tools or logic to find the best route and log it to columns E, F, G.`,
        },
    });
};

export const generateText = async (prompt: string, model: AiModel, search: boolean) => {
    const config: any = { tools: search ? [{ googleSearch: {} }] : [] };
    return await ai.models.generateContent({ model, contents: prompt, config });
};

export const treatSpreadsheet = async (data: Record<string, string>) => {
    const queryParams = new URLSearchParams(data);
    const result = await fetch(`${SYSTEM_CONTROL_URL}?${queryParams.toString()}`, { mode: 'no-cors' });
    window.dispatchEvent(new CustomEvent('sheet-updated'));
    return result;
};

// Added getCommandLogs to resolve the import error in OrderHistory.tsx
export const getCommandLogs = async () => {
    try {
        const response = await fetch(SYSTEM_CONTROL_URL);
        if (!response.ok) return null;
        return await response.json();
    } catch (e) {
        console.error("Error fetching logs:", e);
        return null;
    }
};

export const generateSpeech = async (text: string) => {
  return await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
    },
  });
};

export function createPcmBlob(data: Float32Array): Blob {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return { data: encode(new Uint8Array(int16.buffer)), mimeType: 'audio/pcm;rate=16000' };
}
