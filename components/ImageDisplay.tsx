import React, { useState } from 'react';

interface ImageDisplayProps {
  imageUrl: string | null;
  originalImageUrl?: string | null;
  isLoading?: boolean;
  onViewFullscreen?: (url: string) => void;
}

const ImageDisplay: React.FC<ImageDisplayProps> = ({ imageUrl, originalImageUrl, isLoading = false, onViewFullscreen }) => {
  const ariaTitle = "Edited result";
  const [showOriginal, setShowOriginal] = useState(false);
  const canToggle = !!originalImageUrl && !!imageUrl;

  // Fallback to original image if edited image is missing (e.g. start of history)
  const displayUrl = (canToggle && showOriginal) ? originalImageUrl : (imageUrl || originalImageUrl);

  return (
    <div 
        className="w-full h-full bg-[--color-surface-inset]/50 rounded-xl border-2 border-[--color-border] flex items-center justify-center overflow-hidden relative group"
        onMouseDown={() => canToggle && setShowOriginal(true)}
        onMouseUp={() => canToggle && setShowOriginal(false)}
        onMouseLeave={() => canToggle && setShowOriginal(false)}
        onTouchStart={() => canToggle && setShowOriginal(true)}
        onTouchEnd={() => canToggle && setShowOriginal(false)}
    >
      {isLoading ? (
        <div className="flex flex-col items-center text-[--color-text-tertiary]">
          <svg className="animate-spin h-8 w-8 text-[--color-primary]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-2 text-sm">Generating...</p>
        </div>
      ) : displayUrl ? (
        <>
          <img src={displayUrl} alt={ariaTitle} className="w-full h-full object-contain animate-fade-in" />
           {canToggle && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                {showOriginal ? 'Original' : 'Click & hold to see original'}
            </div>
           )}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 flex items-center justify-center gap-4 transition-all duration-300 opacity-0 group-hover:opacity-100">
              {onViewFullscreen && (
                <button
                  onClick={() => onViewFullscreen(displayUrl!)}
                  className="p-3 bg-[--color-surface-inset]/60 backdrop-blur-sm rounded-full text-white hover:bg-[--color-surface-inset]/80 transition-all duration-200 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white"
                  aria-label={`View ${ariaTitle} image in fullscreen`}
                  title={`View ${ariaTitle} image in fullscreen`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 0h-4m4 0l-5-5" />
                  </svg>
                </button>
              )}
          </div>
        </>
      ) : (
         <div className="text-center text-[--color-text-placeholder] p-4 flex flex-col items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-[--color-surface-3]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.898 20.528L16.25 22.5l-.648-1.972a4.5 4.5 0 01-3.09-3.09l-1.972-.648 1.972-.648a4.5 4.5 0 013.09-3.09l.648-1.972.648 1.972a4.5 4.5 0 013.09 3.09l1.972.648-1.972.648a4.5 4.5 0 01-3.09 3.09z" />
          </svg>
          <p className="mt-4 text-lg font-semibold text-[--color-text-tertiary]">Your masterpiece awaits</p>
          <p className="mt-1 text-sm">The edited image will appear here.</p>
        </div>
      )}
    </div>
  );
};

export default ImageDisplay;