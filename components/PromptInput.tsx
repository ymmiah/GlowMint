import React from 'react';

interface PromptInputProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
  isDisabled: boolean;
  rows?: number;
  placeholder?: string;
  id?: string;
}

const PromptInput: React.FC<PromptInputProps> = ({ prompt, setPrompt, isDisabled, rows = 4, placeholder, id }) => {
  const defaultPlaceholder = isDisabled ? "Upload an image first" : "e.g., 'add a cute cat wearing a party hat' or 'make it look like a vintage photograph'";
  
  return (
    <textarea
      id={id}
      value={prompt}
      onChange={(e) => setPrompt(e.target.value)}
      disabled={isDisabled}
      placeholder={placeholder || defaultPlaceholder}
      rows={rows}
      className="w-full p-4 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      title="Describe the changes you want to make to the image"
    />
  );
};

export default PromptInput;