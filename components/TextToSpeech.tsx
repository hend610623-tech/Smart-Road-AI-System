
import React, { useState, useRef } from 'react';
import { generateSpeech } from '../services/geminiService';
import { decode, decodeAudioData } from '../utils/audio';
import { AudioIcon, LoaderIcon } from './Icons';

const TextToSpeech: React.FC = () => {
  const [text, setText] = useState('Hello! I am a smart driving assistant powered by Gemini.');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const audioContextRef = useRef<AudioContext | null>(null);

  const handleSpeak = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || isLoading) return;

    setIsLoading(true);
    setError('');

    try {
        const response = await generateSpeech(text);
        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        
        if (!base64Audio) {
            throw new Error("No audio data received from the API.");
        }

        if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        }
        
        const audioBuffer = await decodeAudioData(
            decode(base64Audio),
            audioContextRef.current,
            24000,
            1,
        );

        const source = audioContextRef.current.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContextRef.current.destination);
        source.start();

    } catch (err: any) {
      console.error("TTS error:", err);
      setError(err.message || "An error occurred while generating speech.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-800">
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-lg font-semibold text-white">Text to Speech</h2>
        <p className="text-sm text-gray-400">Convert text into natural-sounding speech with Gemini.</p>
      </div>

      <div className="flex-grow p-4 flex items-center justify-center">
        <form onSubmit={handleSpeak} className="w-full max-w-lg">
          {error && <div className="mb-4 p-3 text-sm bg-red-800/50 text-red-300 rounded-lg">{error}</div>}
          
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter text to convert to speech..."
            rows={5}
            className="w-full bg-gray-700 text-gray-200 rounded-lg p-4 resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500 mb-4"
            disabled={isLoading}
          />

          <button
            type="submit"
            className="w-full bg-cyan-600 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 hover:bg-cyan-700 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-500"
            disabled={isLoading || !text.trim()}
          >
            {isLoading ? (
                <>
                    <LoaderIcon className="w-6 h-6" />
                    <span>Generating...</span>
                </>
            ) : (
                <>
                    <AudioIcon className="w-6 h-6" />
                    <span>Speak</span>
                </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TextToSpeech;
