import React, { useState, useEffect } from 'react';
import type { ImageFile } from '../types';
import { editImageWithNanoBanana } from '../services/geminiService';

interface FiltersModalProps {
  image: ImageFile;
  onClose: () => void;
  onApply: (filterPrompt: string) => void;
}

const filters = [
    // Photographic Styles
    { name: 'Cinematic', prompt: "Apply a cinematic color grade. Enhance teals and oranges, add a subtle vignette, and increase contrast for a dramatic, film-like look." },
    { name: 'Golden Hour', prompt: "Bathe the photo in the warm, soft, diffused light of the golden hour. Enhance yellows, oranges, and reds, and cast long, soft shadows for a serene mood." },
    { name: 'Noir', prompt: "Convert to a high-contrast, black and white noir style with deep blacks, dramatic shadows, and a grainy texture, like a classic detective film." },
    { name: 'HDR', prompt: "Dramatically expand the dynamic range of this photo. Make the colors vibrant, enhance details in both the shadows and highlights, and give it a crisp, high-contrast look." },
    
    // Vintage & Retro
    { name: 'Faded Polaroid', prompt: "Recreate the look of a faded, vintage Polaroid from the 1980s. Mute the colors, apply a warm yellowish tint, soften the overall focus, and slightly reduce contrast for a nostalgic, aged feel." },
    { name: 'Technicolor', prompt: "Give this image the look of a classic Technicolor film. Make the colors, especially reds, greens, and blues, extremely vibrant and deeply saturated for a rich and dreamlike cinematic appearance." },
    { name: 'Lomography', prompt: "Recreate the Lomography camera effect. Add a strong vignette, oversaturate colors, increase contrast, and introduce slight edge blur for a spontaneous, artistic feel." },
    { name: 'Light Leaks', prompt: "Add authentic-looking analog film light leaks. Overlay warm-toned streaks of orange, red, and yellow light from the edges for a nostalgic, accidentally-exposed film look." },

    // Artistic & Creative
    { name: 'Dreamy Glow', prompt: "Give the image a soft, ethereal, and dreamy look. Make the highlights glow gently, soften the overall focus, and add a hazy, magical atmosphere to the scene." },
    { name: 'Cyberpunk', prompt: "Transform with a vibrant neon noir aesthetic. Add glowing neon highlights, shifting the color palette towards deep blues, purples, and hot pinks." },
    { name: 'Watercolor', prompt: "Transform this photo into a watercolor painting. Soften details, blend colors with a wet-on-wet effect, and add subtle paper texture." },
    { name: 'Pop Art', prompt: "Recreate the image in Andy Warhol's pop art style. Use bold, vibrant, unrealistic colors, high contrast, and a silkscreen-like texture." },
    { name: 'Infrared', prompt: "Simulate an infrared photograph. Convert foliage to a glowing white, darken the sky to near-black, and create a surreal, high-contrast look." },
    { name: 'Duotone', prompt: "Recolor the entire image using only two colors. All shadows and dark tones should become a deep navy blue, and all highlights and light tones should become a vibrant electric pink. The result should be a high-contrast, stylized duotone image." },
    { name: 'Pastel Tones', prompt: "Recolor the image with a soft pastel palette. Mute harsh tones, reduce contrast, and shift colors towards light pinks, mint greens, and baby blues." },
    { name: 'Monochrome', prompt: "Convert this photo to a rich monochrome image. Unlike high-contrast B&W, preserve a full range of mid-tones for a smooth, filmic, and detailed grayscale image." },
];


interface PreviewState {
  url: string | null;
  loading: boolean;
  error: boolean;
}

const PreviewTile: React.FC<{
  imageUrl: string | null;
  isLoading: boolean;
  hasError: boolean;
  baseImage: string;
}> = ({ imageUrl, isLoading, hasError, baseImage }) => {
  if (isLoading) {
    return (
      <div className="w-full h-full bg-slate-700 animate-pulse" />
    );
  }
  if (hasError) {
    return (
      <div className="w-full h-full bg-slate-700 flex flex-col items-center justify-center text-center text-red-400 p-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="text-xs mt-1">Preview failed</span>
      </div>
    );
  }
  return (
    <img src={imageUrl || baseImage} alt="Filter preview" className="w-full h-full object-cover" />
  );
};


const FiltersModal: React.FC<FiltersModalProps> = ({ image, onClose, onApply }) => {
  const [previews, setPreviews] = useState<Record<string, PreviewState>>(
    filters.reduce((acc, filter) => ({
        ...acc,
        [filter.name]: { url: null, loading: true, error: false }
    }), {})
  );

  useEffect(() => {
    // Use a flag to prevent updates if the component unmounts
    let isCancelled = false;
    
    const generatePreviewsSequentially = async () => {
      const imageInput = {
        base64ImageData: image.base64,
        mimeType: image.mimeType,
      };

      for (const filter of filters) {
        if (isCancelled) break;
        
        try {
          // Add instruction for a low-res preview to speed up generation
          const previewPrompt = `${filter.prompt} IMPORTANT: Generate this as a low-resolution, small thumbnail-sized preview. Speed is more important than quality.`;
          const result = await editImageWithNanoBanana([imageInput], previewPrompt);

          if (isCancelled) break;

          if (result.editedImage) {
            setPreviews(prev => ({
              ...prev,
              [filter.name]: { url: `data:image/png;base64,${result.editedImage}`, loading: false, error: false }
            }));
          } else {
            throw new Error("No image returned");
          }
        } catch (error) {
          if (isCancelled) break;
          
          console.error(`Failed to generate preview for ${filter.name}:`, error);
          setPreviews(prev => ({
            ...prev,
            [filter.name]: { url: null, loading: false, error: true }
          }));
        }
      }
    };

    generatePreviewsSequentially();

    return () => {
        isCancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [image.url, image.base64, image.mimeType]);

  return (
    <div className="fixed inset-0 bg-slate-900/80 flex flex-col justify-center items-center z-50 backdrop-blur-lg animate-fade-in p-4" onClick={onClose}>
      <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-2xl w-full max-w-4xl h-full max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <header className="flex-shrink-0 flex items-center justify-between p-4 border-b border-slate-700">
            <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-3">🖌️ Apply a Filter</h2>
            <button onClick={onClose} className="text-slate-400 text-3xl hover:text-white transition-all duration-200" aria-label="Close">&times;</button>
        </header>
        <div className="flex-grow p-6 overflow-y-auto">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filters.map(filter => {
                    const previewState = previews[filter.name];
                    const canApply = !previewState.loading && !previewState.error;

                    return (
                        <button 
                            key={filter.name} 
                            onClick={() => canApply && onApply(filter.prompt)} 
                            className="group space-y-2 disabled:cursor-not-allowed" 
                            title={filter.prompt}
                            disabled={!canApply}
                            aria-label={`Apply ${filter.name} filter`}
                        >
                            <div className={`aspect-square bg-slate-900 rounded-lg overflow-hidden border-2 transition-all duration-200
                                ${canApply ? 'group-hover:border-teal-500 group-hover:scale-105 transform border-slate-700' : 'border-slate-700'}
                                ${previewState.error ? 'border-red-500/50' : ''}
                            `}>
                                <PreviewTile
                                  imageUrl={previewState.url}
                                  isLoading={previewState.loading}
                                  hasError={previewState.error}
                                  baseImage={image.url}
                                />
                            </div>
                            <p className={`text-center font-semibold transition-colors ${canApply ? 'text-slate-300 group-hover:text-teal-400' : 'text-slate-500'}`}>
                                {filter.name}
                            </p>
                        </button>
                    );
                })}
            </div>
        </div>
         <footer className="flex-shrink-0 flex justify-end items-center gap-4 p-4 border-t border-slate-700 bg-slate-800/50">
            <button onClick={onClose} className="py-2 px-5 bg-slate-600 hover:bg-slate-500 text-white font-bold rounded-lg">Cancel</button>
        </footer>
      </div>
    </div>
  );
};

export default FiltersModal;