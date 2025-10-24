import React, { useState } from 'react';
import type { ImageFile } from '../types';
import PromptInput from './PromptInput';

interface IntelligentTextModalProps {
  image: ImageFile;
  onClose: () => void;
  onApply: (text: string, style: string, position: string) => void;
}

const styles = ['Cinematic Title', 'Handwritten Note', 'Meme Text', 'Elegant Script', 'Futuristic HUD'];
const positions = ['Top', 'Bottom', 'Center', 'Let AI Decide'];

const IntelligentTextModal: React.FC<IntelligentTextModalProps> = ({ image, onClose, onApply }) => {
  const [text, setText] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('Cinematic Title');
  const [selectedPosition, setSelectedPosition] = useState('Let AI Decide');

  const handleApply = () => {
    if (text.trim()) {
      onApply(text, selectedStyle, selectedPosition);
    }
  };

  return (
    <div className="fixed inset-0 bg-[--color-bg]/80 flex flex-col justify-center items-center z-50 backdrop-blur-lg animate-fade-in p-4" onClick={onClose}>
      <div className="bg-[--color-surface-1] border border-[--color-border] rounded-lg shadow-2xl w-full max-w-2xl h-full max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <header className="flex-shrink-0 flex items-center justify-between p-4 border-b border-[--color-border]">
          <h2 className="text-2xl font-bold text-[--color-text-primary] flex items-center gap-3">📝 Intelligent Text</h2>
          <button onClick={onClose} className="text-[--color-text-tertiary] text-3xl hover:text-[--color-text-primary] transition-all duration-200" aria-label="Close">&times;</button>
        </header>
        <div className="flex-grow p-6 overflow-y-auto space-y-6">
          <div className="flex justify-center">
            <img src={image.url} alt="Image to add text to" className="max-h-48 rounded-lg shadow-lg" />
          </div>
          <div>
            <label htmlFor="text-input" className="block text-lg font-semibold text-[--color-primary] mb-2">1. Enter your text</label>
            <PromptInput
              id="text-input"
              prompt={text}
              setPrompt={setText}
              isDisabled={false}
              rows={3}
              placeholder="e.g., 'Happy Birthday, Sarah!' or 'Vacation Vibes'"
            />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[--color-primary] mb-3">2. Choose a style</h3>
            <div className="flex flex-wrap gap-2">
              {styles.map(style => (
                <button
                  key={style}
                  onClick={() => setSelectedStyle(style)}
                  className={`px-4 py-2 text-sm font-semibold rounded-full border-2 transition-all duration-200 ${selectedStyle === style ? 'bg-[--color-primary] border-[--color-primary-hover] text-[--color-primary-text]' : 'bg-[--color-surface-2] border-[--color-border] text-[--color-text-secondary] hover:border-[--color-surface-3]'}`}
                >{style}</button>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[--color-primary] mb-3">3. Suggest a position</h3>
            <div className="flex flex-wrap gap-2">
              {positions.map(pos => (
                <button
                  key={pos}
                  onClick={() => setSelectedPosition(pos)}
                  className={`px-4 py-2 text-sm font-semibold rounded-full border-2 transition-all duration-200 ${selectedPosition === pos ? 'bg-[--color-primary] border-[--color-primary-hover] text-[--color-primary-text]' : 'bg-[--color-surface-2] border-[--color-border] text-[--color-text-secondary] hover:border-[--color-surface-3]'}`}
                >{pos}</button>
              ))}
            </div>
          </div>
        </div>
        <footer className="flex-shrink-0 flex justify-end items-center gap-4 p-4 border-t border-[--color-border] bg-[--color-surface-1]/50">
          <button onClick={onClose} className="py-2 px-5 bg-[--color-surface-3] hover:bg-[--color-text-placeholder] text-[--color-text-primary] font-bold rounded-lg">Cancel</button>
          <button onClick={handleApply} disabled={!text.trim()} className="py-2 px-5 bg-[--color-primary] hover:bg-[--color-primary-hover] text-[--color-primary-text] font-bold rounded-lg disabled:bg-[--color-primary]/50 disabled:cursor-not-allowed">
            Apply Text
          </button>
        </footer>
      </div>
    </div>
  );
};

export default IntelligentTextModal;
