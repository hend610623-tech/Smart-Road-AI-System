import React, { useState } from 'react';
import { AiModel } from '../types';
import { generateText } from '../services/geminiService';
import { SendIcon, LoaderIcon, SparklesIcon, BoltIcon, BrainIcon } from './Icons';

const TextGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [model, setModel] = useState<AiModel>(AiModel.Flash);
  const [response, setResponse] = useState<{ text: string; grounding: any[] }>({ text: '', grounding: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [useGoogleSearch, setUseGoogleSearch] = useState(false);

  const modelConfig = {
    [AiModel.FlashLite]: { label: 'Fast', icon: <BoltIcon className="w-5 h-5 text-green-400" />, description: "For quick, low-latency tasks." },
    [AiModel.Flash]: { label: 'Balanced', icon: <SparklesIcon className="w-5 h-5 text-primary" />, description: "Good for general purpose tasks." },
    [AiModel.Pro]: { label: 'Complex', icon: <BrainIcon className="w-5 h-5 text-purple-400" />, description: "For complex queries needing deep thought." },
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;

    setIsLoading(true);
    setError('');
    setResponse({ text: '', grounding: [] });

    try {
      const result = await generateText(prompt, model, useGoogleSearch);
      const groundingChunks = result.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      setResponse({ text: result.text, grounding: groundingChunks });
    } catch (err: any) {
      console.error("Text generation error:", err);
      setError(err.message || "An error occurred while generating the text.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="p-4 border-b border-white/10">
        <h2 className="text-lg font-semibold text-white">Text Generation Playground</h2>
        <p className="text-sm text-gray-300">Select a model and ask Gemini anything.</p>
      </div>

      <div className="flex-grow p-4 overflow-y-auto">
        {error && <div className="mb-4 p-3 text-sm bg-red-800/50 text-red-300 rounded-lg">{error}</div>}
        
        {isLoading && !response.text && (
            <div className="flex flex-col items-center justify-center h-full text-gray-300">
                <LoaderIcon className="w-12 h-12 mb-4" />
                <p>Gemini is thinking...</p>
            </div>
        )}

        {response.text && (
          <div className="p-4 bg-black/20 rounded-lg">
            <h3 className="text-sm font-semibold text-primary mb-2">Response:</h3>
            <div className="prose prose-invert prose-sm max-w-none text-gray-200 whitespace-pre-wrap">{response.text}</div>
             {response.grounding && response.grounding.length > 0 && (
                <div className="mt-4 pt-3 border-t border-white/10">
                    <h4 className="text-xs font-bold text-gray-400 mb-1">Sources:</h4>
                    <ul className="text-xs space-y-1">
                        {response.grounding.map((chunk: any, i: number) => chunk.web?.uri && (
                            <li key={i}>
                                <a href={chunk.web.uri} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{chunk.web.title}</a>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
          </div>
        )}
      </div>

      <div className="p-4 bg-background/50 border-t border-white/10">
        <form onSubmit={handleSubmit}>
          <div className="flex items-center gap-4 mb-3">
             {Object.values(AiModel).map(m => (
              <button
                key={m}
                type="button"
                onClick={() => setModel(m)}
                className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-full transition-all duration-200 border-2 ${
                  model === m ? 'bg-primary/20 border-primary text-white' : 'bg-white/10 border-transparent hover:bg-white/20 text-gray-200'
                }`}
              >
                {modelConfig[m].icon}
                {modelConfig[m].label}
              </button>
            ))}
          </div>
           <p className="text-xs text-gray-300 mb-3 h-4">{modelConfig[model].description}</p>
          
           <div className="flex items-center gap-2 mb-3">
                <input 
                    type="checkbox" 
                    id="google-search-checkbox" 
                    checked={useGoogleSearch} 
                    onChange={(e) => setUseGoogleSearch(e.target.checked)} 
                    className="w-4 h-4 rounded text-primary bg-white/20 border-white/30 focus:ring-primary focus:ring-offset-background cursor-pointer"
                />
                <label htmlFor="google-search-checkbox" className="text-sm text-gray-300 select-none cursor-pointer">
                    Use Google Search for real-time info
                </label>
            </div>

          <div className="flex items-center gap-2">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter your prompt here..."
              rows={2}
              className="flex-grow bg-white/10 text-gray-200 rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={isLoading}
            />
            <button
              type="submit"
              className="w-12 h-12 flex-shrink-0 bg-primary text-background font-semibold rounded-full flex items-center justify-center filter hover:brightness-95 transition-all disabled:bg-gray-600 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-primary"
              disabled={isLoading || !prompt.trim()}
            >
              {isLoading ? <LoaderIcon className="w-6 h-6" /> : <SendIcon className="w-6 h-6" />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TextGenerator;