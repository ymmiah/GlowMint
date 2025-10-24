import React, { useState } from 'react';
import type { ImageFile } from '../types';
import PromptInput from './PromptInput';

interface GifCreatorModalProps {
  image: ImageFile;
  onClose: () => void;
  onApply: (animationPrompt: string) => void;
}

const GifCreatorModal: React.FC<GifCreatorModalProps> = ({ image, onClose, onApply }) => {
  const [animationPrompt, setAnimationPrompt] = useState('');

  const handleApply = () => {
    if (animationPrompt.trim()) {
      onApply(animationPrompt);
    }
  };
  
  const handleSuggestion = (prompt: string) => {
    setAnimationPrompt(prompt);
  }

  return (
    <div className="fixed inset-0 bg-[--color-bg]/80 flex flex-col justify-center items-center z-50 backdrop-blur-lg animate-fade-in p-4" onClick={onClose}>
      <div className="bg-[--color-surface-1] border border-[--color-border] rounded-lg shadow-2xl w-full max-w-2xl h-full max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <header className="flex-shrink-0 flex items-center justify-between p-4 border-b border-[--color-border]">
          <h2 className="text-2xl font-bold text-[--color-text-primary] flex items-center gap-3">🎬 AI GIF Creator</h2>
          <button onClick={onClose} className="text-[--color-text-tertiary] text-3xl hover:text-[--color-text-primary] transition-all duration-200" aria-label="Close">&times;</button>
        </header>
        <div className="flex-grow p-6 overflow-y-auto space-y-6">
          <div className="flex flex-col items-center text-center">
            <img src={image.url} alt="Image to animate" className="max-h-48 rounded-lg shadow-lg" />
            <p className="text-sm text-[--color-text-tertiary] mt-4 max-w-md">Describe a simple, looping animation. The AI will generate an 8-frame filmstrip of the animation. For best results, focus on subtle movements.</p>
          </div>
          <div>
            <label htmlFor="animation-prompt-input" className="block text-lg font-semibold text-[--color-primary] mb-2">Describe the animation</label>
            <PromptInput
              id="animation-prompt-input"
              prompt={animationPrompt}
              setPrompt={setAnimationPrompt}
              isDisabled={false}
              rows={3}
              placeholder="e.g., 'Make the clouds move slowly from left to right' or 'add gently falling snow'"
            />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[--color-text-secondary] mb-3">Or try a suggestion:</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
                <button onClick={() => handleSuggestion("Subtle zoom in and out pulse effect")} className="p-3 bg-[--color-surface-2] hover:bg-[--color-surface-3] rounded-lg text-left transition-all">Zoom Pulse</button>
                <button onClick={() => handleSuggestion("The water in the image gently ripples")} className="p-3 bg-[--color-surface-2] hover:bg-[--color-surface-3] rounded-lg text-left transition-all">Rippling Water</button>
                <button onClick={() => handleSuggestion("Add glowing, floating particles throughout the scene")} className="p-3 bg-[--color-surface-2] hover:bg-[--color-surface-3] rounded-lg text-left transition-all">Floating Particles</button>
            </div>
          </div>
        </div>
        <footer className="flex-shrink-0 flex justify-end items-center gap-4 p-4 border-t border-[--color-border] bg-[--color-surface-1]/50">
          <button onClick={onClose} className="py-2 px-5 bg-[--color-surface-3] hover:bg-[--color-text-placeholder] text-[--color-text-primary] font-bold rounded-lg">Cancel</button>
          <button onClick={handleApply} disabled={!animationPrompt.trim()} className="py-2 px-5 bg-[--color-primary] hover:bg-[--color-primary-hover] text-[--color-primary-text] font-bold rounded-lg disabled:bg-[--color-primary]/50 disabled:cursor-not-allowed">
            Generate Filmstrip
          </button>
        </footer>
      </div>
    </div>
  );
};

export default GifCreatorModal;
