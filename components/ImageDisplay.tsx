import React from 'react';

interface ImageDisplayProps {
  imageUrl: string | null;
  isLoading?: boolean;
  onViewFullscreen?: (url: string) => void;
  onCompare?: () => void;
  canCompare?: boolean;
}

const ImageDisplay: React.FC<ImageDisplayProps> = ({ imageUrl, isLoading = false, onViewFullscreen, onCompare, canCompare }) => {
  const ariaTitle = "Edited result";

  return (
    <div className="w-full h-full bg-slate-900/50 rounded-xl border-2 border-slate-700 flex items-center justify-center overflow-hidden relative group">
      {isLoading ? (
        <div className="flex flex-col items-center text-slate-400">
          <svg className="animate-spin h-8 w-8 text-teal-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-2 text-sm">Generating...</p>
        </div>
      ) : imageUrl ? (
        <>
          <img src={imageUrl} alt={ariaTitle} className="w-full h-full object-contain animate-fade-in" />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 flex items-center justify-center gap-4 transition-all duration-300 opacity-0 group-hover:opacity-100">
              {onViewFullscreen && (
                <button
                  onClick={() => onViewFullscreen(imageUrl)}
                  className="p-3 bg-slate-900/60 backdrop-blur-sm rounded-full text-white hover:bg-slate-900/80 transition-all duration-200 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-slate-200"
                  aria-label={`View ${ariaTitle} image in fullscreen`}
                  title={`View ${ariaTitle} image in fullscreen`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 0h-4m4 0l-5-5" />
                  </svg>
                </button>
              )}
               {onCompare && canCompare && (
                <button
                    onClick={onCompare}
                    className="py-3 px-5 bg-slate-900/60 backdrop-blur-sm rounded-full text-white hover:bg-slate-900/80 transition-all duration-200 flex items-center gap-2 font-semibold transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-slate-200"
                    aria-label="Compare with original"
                    title="Compare with original"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25" />
                    </svg>
                    <span>Compare</span>
                </button>
              )}
          </div>
        </>
      ) : (
         <div className="text-center text-slate-500 p-4 flex flex-col items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.898 20.528L16.25 22.5l-.648-1.972a4.5 4.5 0 01-3.09-3.09l-1.972-.648 1.972-.648a4.5 4.5 0 013.09-3.09l.648-1.972.648 1.972a4.5 4.5 0 013.09 3.09l1.972.648-1.972.648a4.5 4.5 0 01-3.09 3.09z" />
          </svg>
          <p className="mt-4 text-lg font-semibold text-slate-400">Your masterpiece awaits</p>
          <p className="mt-1 text-sm">The edited image will appear here.</p>
        </div>
      )}
    </div>
  );
};

export default ImageDisplay;