
import React, { useState } from 'react';
import type { ImageFile } from '../types';
import PromptInput from './PromptInput';

interface PictureMergerModalProps {
  images: ImageFile[]; // Expecting exactly 2 images from the main app
  onClose: () => void;
  onApply: (mergerPrompt: string) => void;
}

const PictureMergerModal: React.FC<PictureMergerModalProps> = ({ images, onClose, onApply }) => {
  const [mergerPrompt, setMergerPrompt] = useState('');

  // Safety check, though parent component handles enablement
  if (!images || images.length < 2) return null;

  return (
    <div className="fixed inset-0 bg-[--color-bg]/80 flex flex-col justify-center items-center z-50 backdrop-blur-lg animate-fade-in p-4" onClick={onClose}>
      <div className="bg-[--color-surface-1] border border-[--color-border] rounded-lg shadow-2xl w-full max-w-3xl h-auto flex flex-col" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <header className="flex-shrink-0 flex items-center justify-between p-5 border-b border-[--color-border]">
          <h2 className="text-2xl font-bold text-[--color-text-primary] flex items-center gap-3">
            <span className="text-3xl">👯</span> Merge Two Subjects
          </h2>
          <button onClick={onClose} className="text-[--color-text-tertiary] text-3xl hover:text-[--color-text-primary] transition-all" aria-label="Close">&times;</button>
        </header>
        
        <div className="p-6 md:p-8 space-y-8">
          
          {/* Visual Confirmation of Inputs */}
          <div className="flex items-center justify-center gap-4 md:gap-8">
            <div className="relative group w-1/3 aspect-square bg-[--color-surface-2] rounded-xl overflow-hidden border-2 border-[--color-primary]/30 shadow-lg">
                <img src={images[0].url} alt="Subject 1" className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs font-bold py-1 text-center backdrop-blur-sm">Subject 1</div>
            </div>
            
            <div className="flex flex-col items-center justify-center text-[--color-primary] animate-pulse">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 md:h-12 md:w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
            </div>

            <div className="relative group w-1/3 aspect-square bg-[--color-surface-2] rounded-xl overflow-hidden border-2 border-[--color-secondary]/30 shadow-lg">
                <img src={images[1].url} alt="Subject 2" className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs font-bold py-1 text-center backdrop-blur-sm">Subject 2</div>
            </div>
          </div>

          {/* Prompt Section */}
          <div className="bg-[--color-surface-inset]/30 p-5 rounded-2xl border border-[--color-border]/50">
              <label htmlFor="merger-prompt" className="block text-sm font-bold text-[--color-text-secondary] mb-3 uppercase tracking-wider">
                  Where should they be together?
              </label>
              <PromptInput
                  id="merger-prompt"
                  prompt={mergerPrompt}
                  setPrompt={setMergerPrompt}
                  isDisabled={false}
                  rows={2}
                  placeholder="e.g., 'Sitting together at a Parisian cafe', 'Walking side-by-side on a futuristic bridge', 'Posing for a professional studio portrait'"
              />
              <p className="text-xs text-[--color-text-tertiary] mt-3">
                  <strong className="text-[--color-primary]">AI Goal:</strong> Create <span className="underline decoration-[--color-primary]">ONE single image</span> combining both subjects. The AI will preserve faces, bodies, and clothing from both photos and blend them into your described scene.
              </p>
          </div>
        </div>

        {/* Footer */}
        <footer className="flex-shrink-0 flex justify-end items-center gap-4 p-5 border-t border-[--color-border] bg-[--color-surface-1]/50 rounded-b-lg">
          <button onClick={onClose} className="py-2.5 px-6 bg-[--color-surface-3] hover:bg-[--color-text-placeholder] text-[--color-text-primary] font-bold rounded-xl transition-all">Cancel</button>
          <button 
            onClick={() => onApply(mergerPrompt)} 
            className="py-2.5 px-8 bg-gradient-to-r from-[--color-primary] to-[--color-secondary] text-white font-bold rounded-xl shadow-lg transform hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2"
          >
            <span>🚀</span> Merge into One Image
          </button>
        </footer>
      </div>
    </div>
  );
};

export default PictureMergerModal;
