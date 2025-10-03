
import React, { useState, useRef, useCallback } from 'react';
import type { ImageFile } from '../types';
import PromptInput from './PromptInput';

interface StyleRemixModalProps {
  image: ImageFile; // content image
  onClose: () => void;
  onApply: (styleImage: ImageFile, remixPrompt: string) => void;
}

const StyleRemixModal: React.FC<StyleRemixModalProps> = ({ image, onClose, onApply }) => {
  const [styleImage, setStyleImage] = useState<ImageFile | null>(null);
  const [remixPrompt, setRemixPrompt] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(async (file: File | null) => {
    if (!file || !file.type.startsWith('image/')) return;

    setIsUploading(true);

    try {
      const fileData = await new Promise<ImageFile>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const url = reader.result as string;
          const base64 = url.split(',')[1];
          resolve({ url, base64, mimeType: file.type });
        };
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
      });
      setStyleImage(fileData);
    } catch (error) {
      console.error("Error processing style image:", error);
    } finally {
      setIsUploading(false);
    }
  }, []);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    processFile(event.target.files?.[0] || null);
    if (event.target) event.target.value = '';
  }, [processFile]);

  const handleDrop = useCallback((event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    processFile(event.dataTransfer.files?.[0] || null);
  }, [processFile]);

  const handleDragOver = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  };
  
  const handleDragLeave = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 flex flex-col justify-center items-center z-50 backdrop-blur-lg animate-fade-in p-4" onClick={onClose}>
      <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-2xl w-full max-w-3xl h-full max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <header className="flex-shrink-0 flex items-center justify-between p-4 border-b border-slate-700">
          <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-3">🎭 Artistic Remix</h2>
          <button onClick={onClose} className="text-slate-400 text-3xl hover:text-white transition-all duration-200" aria-label="Close">&times;</button>
        </header>
        
        <div className="flex-grow p-6 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Content Image */}
            <div className="flex flex-col items-center gap-3">
              <h3 className="font-semibold text-lg text-slate-300">Content Image</h3>
              <div className="w-full aspect-square bg-slate-900 rounded-lg overflow-hidden flex items-center justify-center">
                  <img src={image.url} alt="Content" className="max-w-full max-h-full object-contain" />
              </div>
              <p className="text-sm text-slate-400 text-center">This is the image that will be transformed.</p>
            </div>

            {/* Style Image */}
            <div className="flex flex-col items-center gap-3">
              <h3 className="font-semibold text-lg text-slate-300">Style Image</h3>
              <div className="w-full aspect-square">
                 <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/png, image/jpeg, image/webp"
                  className="hidden"
                  id="style-image-upload-input"
                />
                <label
                  htmlFor="style-image-upload-input"
                  className={`w-full h-full border-2 border-dashed rounded-lg flex flex-col justify-center items-center cursor-pointer transition-colors duration-300
                    ${isDragging ? 'border-teal-500 bg-slate-700/50' : 'border-slate-600 hover:border-teal-500 hover:bg-slate-700/50'}
                  `}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  title="Click or drag to upload the style image"
                >
                  {isUploading ? (
                     <div className="text-center text-slate-400">Loading...</div>
                  ) : styleImage ? (
                      <img src={styleImage.url} alt="Style" className="max-w-full max-h-full object-contain" />
                  ) : (
                    <div className="text-center text-slate-400 p-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      <p className="mt-2 text-sm font-semibold">Upload Style Image</p>
                      <p className="text-xs">Click or drag & drop</p>
                    </div>
                  )}
                </label>
              </div>
               <p className="text-sm text-slate-400 text-center">Upload an image whose style you want to copy.</p>
            </div>
          </div>
          <div className="mt-6">
              <label htmlFor="remix-prompt-input" className="block text-sm font-medium text-slate-300 mb-2">
                  Optional: Refine the style transfer
              </label>
              <PromptInput
                  id="remix-prompt-input"
                  prompt={remixPrompt}
                  setPrompt={setRemixPrompt}
                  isDisabled={!styleImage}
                  rows={2}
                  placeholder="e.g., 'remix only the color palette', 'apply the Van Gogh brush strokes', 'combine the cubist style'"
              />
              <p className="text-xs text-slate-500 mt-2">Leave blank to let the AI figure out the style automatically.</p>
          </div>
        </div>

        <footer className="flex-shrink-0 flex justify-end items-center gap-4 p-4 border-t border-slate-700 bg-slate-800/50">
          <button onClick={onClose} className="py-2 px-5 bg-slate-600 hover:bg-slate-500 text-white font-bold rounded-lg">Cancel</button>
          <button 
            onClick={() => styleImage && onApply(styleImage, remixPrompt)} 
            disabled={!styleImage || isUploading} 
            className="py-2 px-5 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-lg disabled:bg-teal-600/50 disabled:cursor-not-allowed"
          >
            Apply Remix
          </button>
        </footer>
      </div>
    </div>
  );
};

export default StyleRemixModal;
