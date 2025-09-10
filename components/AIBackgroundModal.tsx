import React, { useState, useEffect, useCallback } from 'react';
import type { ImageFile } from '../types';
import { generateText } from '../services/geminiService';
import { Type } from '@google/genai';
import PromptInput from './PromptInput';

interface AIBackgroundModalProps {
  image: ImageFile;
  onClose: () => void;
  onApply: (backgroundPrompt: string) => void;
}

interface Suggestion {
  name: string;
  prompt: string;
}

const suggestionSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            name: { type: Type.STRING },
            prompt: { type: Type.STRING },
        },
    },
};

const AIBackgroundModal: React.FC<AIBackgroundModalProps> = ({ image, onClose, onApply }) => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [customPrompt, setCustomPrompt] = useState('');

  useEffect(() => {
    const fetchSuggestions = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const prompt = "You are an expert in photography and composition. Analyze the provided image and identify the main subject. Based on the subject, suggest 5 creative and fitting background scenes. For each suggestion, provide a 'name' (e.g., 'Cyberpunk City') and a detailed 'prompt' that could be used to generate that background for the subject. Return the result as a JSON array of objects.";
        const resultText = await generateText(prompt, suggestionSchema);
        const parsedSuggestions = JSON.parse(resultText);
        setSuggestions(parsedSuggestions);
      } catch (e) {
        console.error("Failed to fetch background suggestions:", e);
        setError("Could not get AI suggestions. Please try again or enter a custom background prompt.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchSuggestions();
  }, [image.url]);

  const handleApply = (prompt: string) => {
    if (prompt.trim()) {
      onApply(prompt);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 flex flex-col justify-center items-center z-50 backdrop-blur-lg animate-fade-in p-4" onClick={onClose}>
      <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-2xl w-full max-w-2xl h-full max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <header className="flex-shrink-0 flex items-center justify-between p-4 border-b border-slate-700">
            <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-3">🏞️ AI Background Replacement</h2>
            <button onClick={onClose} className="text-slate-400 text-3xl hover:text-white transition-all duration-200" aria-label="Close">&times;</button>
        </header>
        <div className="flex-grow p-6 overflow-y-auto space-y-6">
            <div className="flex justify-center">
                <img src={image.url} alt="Original for background replacement" className="max-h-48 rounded-lg shadow-lg" />
            </div>
            <div>
                <h3 className="text-lg font-semibold text-teal-400 mb-2">AI Suggestions</h3>
                {isLoading && <div className="text-center p-4">Loading suggestions...</div>}
                {error && <div className="text-center p-4 text-red-400">{error}</div>}
                {!isLoading && !error && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {suggestions.map((suggestion, index) => (
                            <button key={index} onClick={() => handleApply(suggestion.prompt)} className="p-3 bg-slate-700 hover:bg-teal-600 rounded-lg text-left transition-all duration-200 transform hover:-translate-y-1">
                                <p className="font-bold">{suggestion.name}</p>
                                <p className="text-xs text-slate-400 mt-1 truncate">{suggestion.prompt}</p>
                            </button>
                        ))}
                    </div>
                )}
            </div>
            <div className="relative">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="w-full border-t border-slate-600" />
                </div>
                <div className="relative flex justify-center">
                    <span className="bg-slate-800 px-2 text-sm text-slate-400">OR</span>
                </div>
            </div>
            <div>
                 <h3 className="text-lg font-semibold text-teal-400 mb-2">Describe Your Own Background</h3>
                 <PromptInput 
                    prompt={customPrompt}
                    setPrompt={setCustomPrompt}
                    isDisabled={false}
                    rows={2}
                    placeholder="e.g., 'a mystical forest at night with glowing mushrooms'"
                 />
            </div>
        </div>
        <footer className="flex-shrink-0 flex justify-end items-center gap-4 p-4 border-t border-slate-700 bg-slate-800/50">
            <button onClick={onClose} className="py-2 px-5 bg-slate-600 hover:bg-slate-500 text-white font-bold rounded-lg">Cancel</button>
            <button onClick={() => handleApply(customPrompt)} disabled={!customPrompt.trim()} className="py-2 px-5 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-lg disabled:bg-teal-600/50 disabled:cursor-not-allowed">
                Apply Custom Background
            </button>
        </footer>
      </div>
    </div>
  );
};

export default AIBackgroundModal;
