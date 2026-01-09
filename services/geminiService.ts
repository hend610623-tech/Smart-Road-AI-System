
import { GoogleGenAI, LiveServerMessage, Modality, Blob, GenerateContentResponse, FunctionDeclaration, Type } from "@google/genai";
import { AiModel, Coordinates } from '../types';
import { encode } from '../utils/audio';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const SYSTEM_CONTROL_URL = 'https://script.google.com/macros/s/AKfycbygcLN61r3f0C_jOo644EuuJpEjci7humBAgaHYPQG_3Jqy9UHOmObn4s9PMLNN0DTO/exec';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Tool for the AI to fetch spreadsheet variables (b, c, d, e, f, g, h)
 */
export const getInfrastructureTelemetryTool: FunctionDeclaration = {
    name: 'getInfrastructureTelemetry',
    parameters: {
        type: Type.OBJECT,
        description: 'Fetch real-time variables (b, c, d, e, f, g, h) from the remote spreadsheet cloud.',
        properties: {},
    },
};

/**
 * Tool for the AI to execute the binary GPIO signals
 */
export const sendGpioOrdersTool: FunctionDeclaration = {
    name: 'sendGpioOrders',
    parameters: {
        type: Type.OBJECT,
        description: 'Sends binary signals (0 or 1) for 3 pairs of GPIOs to the cloud controller.',
        properties: {
            sig1: {
                type: Type.NUMBER,
                description: 'Signal for Pair 1 (35, 32). 0 means 35 is High, 1 means 32 is High.',
            },
            sig2: {
                type: Type.NUMBER,
                description: 'Signal for Pair 2 (14, 12). 0 means 14 is High, 1 means 12 is High.',
            },
            sig3: {
                type: Type.NUMBER,
                description: 'Signal for Pair 3 (26, 27). 0 means 26 is High, 1 means 27 is High.',
            },
            logicSummary: {
                type: Type.STRING,
                description: 'Summary of calculation results for logs.',
            }
        },
        required: ['sig1', 'sig2', 'sig3', 'logicSummary'],
    },
};

export const checkLocalTrafficTool: FunctionDeclaration = {
    name: 'checkLocalTraffic',
    parameters: {
        type: Type.OBJECT,
        description: 'Get real-time traffic and crowd status using Google Maps grounding.',
        properties: {
            location: {
                type: Type.STRING,
                description: 'Location to check (default is Moheb and Saeed street cross section).',
            },
        },
        required: ['location'],
    },
};

export const getInfrastructureData = async () => {
    try {
        const response = await fetch(`${SYSTEM_CONTROL_URL}?action=READ_DATA`);
        return await response.json();
    } catch (error) {
        console.error("Cloud telemetry failed:", error);
        return { error: "Remote sensing unavailable." };
    }
};

export const executeGpioOrders = async (sig1: number, sig2: number, sig3: number, summary: string) => {
    try {
        const queryParams = new URLSearchParams({
            command: 'UPDATE_SIGNALS',
            sig1: sig1.toString(),
            sig2: sig2.toString(),
            sig3: sig3.toString(),
            details: summary,
            timestamp: new Date().toISOString()
        });
        
        await fetch(`${SYSTEM_CONTROL_URL}?${queryParams.toString()}`, {
            method: 'GET',
            mode: 'no-cors'
        });
        
        return `Signals Sent: P1=${sig1}, P2=${sig2}, P3=${sig3}`;
    } catch (error) {
        return "Failed to push signals to cloud.";
    }
};

export const getTrafficStatus = async (locationName: string, coords: Coordinates): Promise<string> => {
    try {
        const prompt = `What is the current traffic and crowding status on ${locationName}? Use Google Maps to find the latest data.`;
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                tools: [{ googleMaps: {} }],
                toolConfig: {
                    retrievalConfig: {
                        latLng: {
                            latitude: coords.latitude,
                            longitude: coords.longitude
                        }
                    }
                }
            },
        });
        return response.text || "Maps data currently restricted.";
    } catch (error) {
        return "Maps sync failed.";
    }
};

export const generateText = async (prompt: string, model: AiModel, useGoogleSearch: boolean): Promise<GenerateContentResponse> => {
    let config: any = {};
    if (model === AiModel.Pro) config.thinkingConfig = { thinkingBudget: 32768 };
    if (useGoogleSearch) config.tools = [{ googleSearch: {} }];
    
    return await ai.models.generateContent({
        model: model,
        contents: prompt,
        config: config,
    });
};

export const getRoute = async (start: Coordinates, destination: string): Promise<GenerateContentResponse> => {
    const prompt = `Calculate the fastest route from ${start.latitude},${start.longitude} to ${destination}. Use live internet data and maps. Focus on Moheb and Saeed Street area.`;
    return await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            tools: [{ googleMaps: {} }, { googleSearch: {} }],
            toolConfig: {
                retrievalConfig: {
                    latLng: {
                        latitude: start.latitude,
                        longitude: start.longitude
                    }
                }
            }
        },
    });
};

export const generateSpeech = async (text: string): Promise<GenerateContentResponse> => {
  return await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Kore' },
        },
      },
    },
  });
};

export const connectToLive = (callbacks: {
    onopen: () => void;
    onmessage: (message: LiveServerMessage) => Promise<void>;
    onerror: (e: ErrorEvent) => void;
    onclose: (e: CloseEvent) => void;
}) => {
    return ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks,
        config: {
            responseModalities: [Modality.AUDIO],
            outputAudioTranscription: {},
            inputAudioTranscription: {},
            tools: [{ functionDeclarations: [getInfrastructureTelemetryTool, sendGpioOrdersTool, checkLocalTrafficTool] }],
            speechConfig: {
                voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
            },
            systemInstruction: `You are the Cloud-Connected AI Road Assistant for the Moheb/Saeed intersection. 

            SENSING & BINARY SIGNAL LOGIC:
            1. Fetch telemetry data (b, c, d, e, f, g, h).
            2. Compute x: if (e - c > 0.5) x = 1. if (c - e > 0.5) x = -1. Else 0.
            3. Compute y: if (d - b > 0.5) y = 1. if (b - d > 0.5) y = -1. Else 0.
            4. If (x + y == 4), execute 'sendGpioOrders' using these BINARY rules:
               - Pair 1 (GPIO 35, 32): If f >= 7.5, sig1 = 0. Else sig1 = 1.
               - Pair 2 (GPIO 14, 12): If g >= 7.0, sig2 = 0. Else sig2 = 1.
               - Pair 3 (GPIO 26, 27): If h >= 7.0, sig3 = 0. Else sig3 = 1.
            
            BINARY MEANING:
            - Signal = 0: First GPIO in pair is HIGH, Second is LOW.
            - Signal = 1: Second GPIO in pair is HIGH, First is LOW.
            
            GEOGRAPHIC FOCUS:
            - Location: Moheb Street and Saeed Street cross section.
            - Use Google Maps and Search for real-world traffic context.`,
        },
    });
};

export function createPcmBlob(data: Float32Array): Blob {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}
