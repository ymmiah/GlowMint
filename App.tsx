
import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import Header from './components/Header';
import ImageUploader from './components/ImageUploader';
import PromptInput from './components/PromptInput';
import ImageDisplay from './components/ImageDisplay';
import LoadingOverlay from './components/LoadingOverlay';
import FullscreenModal from './components/FullscreenModal';
import ImageCompareSlider from './components/ImageCompareSlider';
import ResolutionSelector from './components/ResolutionSelector';
import MagicEraseModal from './components/MagicEraseModal';
import Footer from './components/Footer';
import TutorialModal from './components/TutorialModal';
import { editImageWithNanoBanana, generateImageWithImagen, analyzeImage } from './services/geminiService';
import type { ImageFile } from './types';
import MagicReplaceModal from './components/MagicReplaceModal';
import AIBackgroundModal from './components/AIBackgroundModal';
import FiltersModal from './components/FiltersModal';
import { CropModal } from './components/CropModal';
import StyleRemixModal from './components/StyleRemixModal';
import IntelligentTextModal from './components/IntelligentTextModal';
import GifCreatorModal from './components/GifCreatorModal';
import { createCacheKey, cacheService } from './services/cacheService';
import AspectRatioSelector from './components/AspectRatioSelector';
import TextDisplay from './components/TextDisplay';

// --- Types ---
type ErrorCode = 'INVALID_KEY' | 'QUOTA_EXCEEDED' | 'GENERIC_ERROR' | 'VALIDATION_ERROR';
type AppError = { 
    id: string;
    code: ErrorCode; 
    message: string; 
    timestamp: string;
    retryAction?: () => void;
    technicalDetails?: string;
};
type Resolution = 'Low' | 'Medium' | 'High';
type EditMode = 'single' | 'batch';
type ViewMode = 'toggle' | 'slider' | 'side-by-side';
type ActiveModal = 'magicErase' | 'magicReplace' | 'aiBackground' | 'filters' | 'crop' | 'styleRemix' | 'intelligentText' | 'gifCreator' | null;
type BatchStatus = 'queued' | 'processing' | 'done' | 'error';
type BatchResult = { id: string; status: BatchStatus; imageUrl?: string; error?: string; originalUrl: string; };
type EditHistoryItem = { imageUrl: string; prompt: string; resolution: Resolution; negativePrompt: string; };
type AppMode = 'edit' | 'generate';
type AspectRatio = '1:1' | '3:4' | '4:3' | '9:16' | '16:9';

// --- Error Logging Utility ---
const generateReferenceId = () => `ERR-${Math.random().toString(16).substring(2, 10).toUpperCase()}`;

// --- Error Display Component ---
const errorDetailsMap: Record<ErrorCode, { emoji: string; title: string; borderColor: string; bgColor: string; textColor: string; canRetry: boolean; }> = {
  INVALID_KEY: { emoji: '🔑', title: 'API Key Issue', borderColor: 'border-[--color-warning-border]', bgColor: 'bg-[--color-warning-bg]/50', textColor: 'text-[--color-warning-text]', canRetry: false },
  QUOTA_EXCEEDED: { emoji: '⏳', title: 'Quota Reached', borderColor: 'border-[--color-quota-border]', bgColor: 'bg-[--color-quota-bg]/50', textColor: 'text-[--color-quota-text]', canRetry: true },
  GENERIC_ERROR: { emoji: '🤖', title: 'System Error', borderColor: 'border-[--color-error-border]', bgColor: 'bg-[--color-error-bg]/50', textColor: 'text-[--color-error-text]', canRetry: true },
  VALIDATION_ERROR: { emoji: '🖼️', title: 'Input Required', borderColor: 'border-[--color-info-border]', bgColor: 'bg-[--color-info-bg]/50', textColor: 'text-[--color-info-text]', canRetry: false },
};

const ErrorDisplay: React.FC<{ error: AppError | null }> = ({ error }) => {
  const [showLog, setShowLog] = useState(false);
  if (!error) return null;
  const details = errorDetailsMap[error.code] || errorDetailsMap.GENERIC_ERROR;

  return (
    <div className={`p-5 rounded-2xl text-center animate-fade-in border-2 ${details.borderColor} ${details.bgColor} ${details.textColor} flex flex-col items-center gap-4 shadow-xl max-w-md mx-auto`} role="alert">
      <div className="text-5xl animate-bounce">{details.emoji}</div>
      <div>
        <p className="font-bold text-xl">{details.title}</p>
        <p className="text-sm mt-2 opacity-90 leading-relaxed">{error.message}</p>
      </div>

      <div className="flex flex-col gap-2 w-full">
        {details.canRetry && error.retryAction && (
          <button 
            onClick={error.retryAction}
            className="w-full py-2.5 px-4 bg-white/20 hover:bg-white/30 active:scale-95 rounded-lg font-bold transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h5M20 20v-5h-5M4 4l16 16" /></svg>
            Retry Operation
          </button>
        )}
        
        <button 
          onClick={() => setShowLog(!showLog)}
          className="text-[10px] uppercase tracking-wider font-bold opacity-60 hover:opacity-100 transition-opacity mt-2"
        >
          {showLog ? 'Close Error Logbook' : 'Open Error Logbook'}
        </button>

        {showLog && (
            <div className="mt-2 p-3 bg-black/40 backdrop-blur-sm rounded-lg text-left font-mono text-[10px] space-y-1 overflow-x-auto border border-white/10 shadow-inner">
                <p><span className="text-[--color-primary]">REFERENCE:</span> {error.id}</p>
                <p><span className="text-[--color-primary]">TIMESTAMP:</span> {error.timestamp}</p>
                <p><span className="text-[--color-primary]">LOG_CODE:</span> {error.code}</p>
                {error.technicalDetails && (
                    <div className="mt-2 pt-2 border-t border-white/10">
                        <p className="text-white/40 mb-1">DIAGNOSTICS:</p>
                        <p className="whitespace-pre-wrap leading-tight">{error.technicalDetails}</p>
                    </div>
                )}
            </div>
        )}
      </div>

      <div className="text-[9px] font-mono opacity-40 select-all mt-1">
        Diagnostic ID: {error.id}
      </div>
    </div>
  );
};

// --- Tool Definitions ---
const toolSections = [
    {
        title: 'AI Enhance & Fix',
        tools: [
            { id: 'enhance', label: 'Enhance', emoji: '🚀', title: 'Automatically enhance a single image', prompt: "Perform an automatic enhancement on this photograph. Your tasks are: 1. Increase the overall resolution and clarity. 2. Reduce any visible noise or compression artifacts. 3. Sharpen important details without creating halos. 4. Do not alter the subject matter or composition." },
            { id: 'autoFix', label: 'Auto Fix', emoji: '💡', title: 'Automatically fix lighting and color', prompt: "Perform an automatic photo correction. Your tasks are: 1. Analyze the histogram and adjust brightness and contrast for a balanced exposure. 2. Correct any color cast to achieve natural-looking tones. 3. Adjust shadows and highlights to reveal details. The result should be a natural improvement." },
            { id: 'restorePhoto', label: 'Restore', emoji: '🔧', title: 'Restore old, damaged, or faded photos', prompt: "Task: Photo Restoration. Analyze the provided image for damage. Your goal is to restore it to its original condition. Actions: 1. Remove all physical damage: scratches, dust, tears, and stains. 2. Correct chemical damage: color fading and shifts. 3. Reconstruct minor missing areas if necessary. Maintain the original character of the photograph." },
            { id: 'upscale', label: 'Upscale', emoji: '📈', title: 'Increase image resolution with AI', prompt: "Upscale this image to a higher resolution. Use AI to intelligently add detail and sharpness. The output should be a crisp, high-quality version of the input, free of artifacts. Do not change the image content." },
        ]
    },
    {
        title: 'AI Insights',
        tools: [
            { id: 'quickAnalysis', label: 'Quick Analysis', emoji: '🧐', title: 'Get a quick description of the image' },
            { id: 'deepAnalysis', label: 'Deep Analysis', emoji: '🧠', title: 'Get a deep, thoughtful analysis of the image' },
        ]
    },
    {
        title: 'Creative Tools',
        tools: [
            { id: 'colorize', label: 'Colorize', emoji: '🎨', title: 'Colorize a single black and white photo', prompt: "Task: Colorization. Analyze this black and white photograph and apply realistic, historically-appropriate colors. Pay attention to textures like skin, fabric, and natural elements to ensure the colors are believable." },
            { id: 'removeBg', label: 'Remove BG', emoji: '✂️', title: 'Remove the background', prompt: "Identify the primary subject in this image. Create a precise cutout of the subject. Replace the entire background with solid white (#FFFFFF). The subject's edges must be clean and free of any background fringing." },
            { id: 'replaceSky', label: 'Replace Sky', emoji: '☁️', title: 'Replace the sky with a beautiful new one', prompt: 'Identify the sky in this image. Replace it with a dramatic, beautiful, partly cloudy blue sky. Crucially, adjust the lighting and color temperature of the foreground and subject to perfectly match the new sky for a seamless, photorealistic composition.' },
            { id: 'colorSplash', label: 'Color Pop', emoji: '🎯', title: 'Make the main subject color, background B&W', prompt: "Identify the main subject of this image. Convert the entire background to black and white, while keeping the main subject in its full, original color. The transition between color and monochrome should be precise." },
            { id: '3dPhoto', label: '3D Effect', emoji: '🧊', title: 'Create a high-quality 3D parallax effect filmstrip', prompt: "Analyze the image to create a high-quality 3D photo effect. Your goal is to generate a horizontal filmstrip of 8 frames that, when played in sequence, create a perfectly smooth, looping 3D parallax effect. Identify foreground, midground, and background elements. Shift the foreground elements more than the background to simulate depth. The final output must be a single image containing all 8 frames in a 1x8 grid." }
        ]
    },
    {
        title: 'Artistic Styles',
        tools: [
            { id: 'sketch', label: 'Sketch', emoji: '✏️', title: 'Convert the photo to a pencil sketch', prompt: "Convert this image into a detailed pencil sketch. The lines should be clean and the shading should be realistic, capturing the forms and textures of the original photo. The background should be a clean white paper texture." },
            { id: 'cartoon', label: 'Cartoon', emoji: '🤩', title: 'Turn the photo into a cartoon', prompt: "Transform this photo into a vibrant cartoon. Use bold outlines, simplified shapes, and bright, flat colors. The style should be fun and exaggerated, like a modern animated movie." },
            { id: 'impressionism', label: 'Impressionist', emoji: '🧑‍🎨', title: 'Recreate in an impressionistic painting style', prompt: "Recreate this image in the style of an Impressionist painting. Use short, thick brushstrokes, emphasize the play of light, and use a vibrant color palette to capture the feeling of the moment." },
            { id: 'pixelArt', label: 'Pixel Art', emoji: '👾', title: 'Convert the image to pixel art', prompt: "Convert this image into 16-bit pixel art. Use a limited color palette and simplify the details into clear, blocky pixels. The final result should look like it's from a classic video game." },
            { id: 'comicBook', label: 'Comic Book', emoji: '💥', title: 'Turn the photo into a professional comic book panel', prompt: "Transform this photograph into a high-end, modern comic book panel. Use sharp, clean black ink outlines for all shapes and contours. Apply a sophisticated halftone dot pattern (Ben-Day dots) for gradients and shading. Use a vibrant, high-contrast 'pop art' color palette. The result should look like it was professionally illustrated for a premium comic series." },
            { id: 'lineArt', label: 'Line Art', emoji: '✒️', title: 'Convert photo to black & white line art drawing', prompt: "Convert this photo into a clean, high-quality black and white line art drawing. Trace the main contours and important details with precise, smooth lines. The background should be completely white. Do not include any shading, just the outlines." }
        ]
    },
    {
        title: 'Portrait Touch-up',
        tools: [
            { id: 'smoothSkin', label: 'Smooth Skin', emoji: '✨', title: 'Subtly smooth skin on faces', prompt: "Analyze the image for human faces. If a face is detected, apply a subtle skin smoothing effect. Reduce minor blemishes and wrinkles but preserve the natural skin texture to avoid an artificial look. If no face is detected, return the original image unchanged." },
            { id: 'removeBlemishes', label: 'Blemish Fix', emoji: '🧼', title: 'Remove minor skin blemishes', prompt: "Analyze the image for human faces. If a face is detected, identify and remove small, temporary blemishes like pimples or spots. The correction must be seamless. If no face is detected, return the original image unchanged." },
            { id: 'brightenEyes', label: 'Brighten Eyes', emoji: '👀', title: 'Make eyes more vibrant', prompt: "Analyze the image for human faces. If a face is detected, subtly enhance the eyes. Increase brightness and saturation in the irises and add a small, highlight to make them appear more vibrant. If no face is detected, return the original image unchanged." },
            { id: 'whitenTeeth', label: 'Whiten Teeth', emoji: '😁', title: 'Gently whiten teeth in smiles', prompt: "Analyze the image for human faces. If a smiling mouth with visible teeth is present, gently whiten the teeth to a natural, healthy shade. Avoid an unnaturally bright, pure white result. If no smiling faces with visible teeth are detected, return the original image unchanged." },
        ]
    },
     {
        title: 'Interactive Power Tools',
        tools: [
            { id: 'magicErase', label: 'Magic Erase', emoji: '🪄', title: 'Erase unwanted objects' },
            { id: 'magicReplace', label: 'Magic Replace', emoji: '🔁', title: 'Replace parts of the image' },
            { id: 'aiBackground', label: 'AI Background', emoji: '🏞️', title: 'Replace the background' },
            { id: 'crop', label: 'Crop & Rotate', emoji: '📏', title: 'Crop, rotate, and straighten' },
            { id: 'filters', label: 'Filters', emoji: '🖌️', title: 'Apply artistic filters' },
        ]
    },
    {
        title: 'New Creative Suite',
        tools: [
            { id: 'styleRemix', label: 'Artistic Remix', emoji: '🎭', title: 'Transfer the style from another image' },
            { id: 'intelligentText', label: 'Intelligent Text', emoji: '📝', title: 'Add context-aware text' },
            { id: 'gifCreator', label: 'AI GIF Creator', emoji: '🎬', title: 'Generate an 8-frame filmstrip' },
        ]
    }
];

// --- Main App Component ---
const App: React.FC = () => {
    // Core state
    const [images, setImages] = useState<ImageFile[]>([]);
    const [prompt, setPrompt] = useState<string>('');
    const [negativePrompt, setNegativePrompt] = useState('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<AppError | null>(null);
    const [resolution, setResolution] = useState<Resolution>('Medium');
    const [cachedResolutions, setCachedResolutions] = useState<Set<Resolution>>(new Set());
    const isFirstRender = useRef(true);

    // Mode state
    const [appMode, setAppMode] = useState<AppMode>('edit');
    const [editMode, setEditMode] = useState<EditMode>('single');
    const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');

    // Result and history state
    const [editHistory, setEditHistory] = useState<EditHistoryItem[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const [batchResults, setBatchResults] = useState<BatchResult[]>([]);
    const [currentBatchIndex, setCurrentBatchIndex] = useState(0);
    const [analysisResult, setAnalysisResult] = useState<string | null>(null);
    const [analysisTitle, setAnalysisTitle] = useState<string>('');

    // UI/Modal state
    const [fullscreenImageUrl, setFullscreenImageUrl] = useState<string | null>(null);
    const [isTutorialOpen, setIsTutorialOpen] = useState(false);
    const [activeModal, setActiveModal] = useState<ActiveModal>(null);
    const [viewMode, setViewMode] = useState<ViewMode>('toggle');
    const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

    const currentImage = useMemo(() => (editMode === 'single' ? images[0] : images[currentBatchIndex]), [editMode, images, currentBatchIndex]);
    const currentResult = useMemo(() => {
        if (editMode === 'single' && historyIndex >= 0 && editHistory[historyIndex]) return editHistory[historyIndex].imageUrl;
        if (editMode === 'batch' && batchResults[currentBatchIndex]?.status === 'done') return batchResults[currentBatchIndex].imageUrl;
        return null;
    }, [editMode, historyIndex, editHistory, batchResults, currentBatchIndex]);

    // --- Diagnostic Error Reporter ---
    const reportError = useCallback((e: any, code: ErrorCode = 'GENERIC_ERROR', retryAction?: () => void, metadata?: any) => {
        const errorMsg = e.message || String(e);
        const [providedCode, cleanMsg] = errorMsg.includes('::') ? errorMsg.split('::') : [null, errorMsg];
        
        const finalCode = (providedCode as ErrorCode) || code;
        const refId = generateReferenceId();
        
        const technicalDetails = [
            `Action: ${appMode}`,
            `EditMode: ${editMode}`,
            `Images_Count: ${images.length}`,
            `Has_Prompt: ${!!prompt}`,
            metadata ? `Metadata: ${JSON.stringify(metadata)}` : null,
            `Stack: ${e.stack || 'Unavailable'}`
        ].filter(Boolean).join('\n');

        const newError: AppError = {
            id: refId,
            code: finalCode,
            message: cleanMsg || 'An unexpected failure occurred. Please retry.',
            timestamp: new Date().toLocaleTimeString() + ' ' + new Date().toLocaleDateString(),
            retryAction,
            technicalDetails
        };
        
        setError(newError);
        console.error(`[Diagnostic Log] ${refId}:`, newError);
    }, [appMode, editMode, images.length, prompt]);

    // --- Handlers ---
    const handleAddImages = useCallback((newImages: ImageFile[]) => {
        setImages(prev => [...prev, ...newImages]);
        setError(null);
        setAnalysisResult(null);
    }, []);

    const handleRemoveImage = useCallback((index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
        setCurrentBatchIndex(prev => Math.min(prev, Math.max(0, images.length - 2))); 
    }, [images.length]);

    const handleAppModeChange = (mode: AppMode) => {
        setAppMode(mode);
        setError(null);
        setAnalysisResult(null);
        if (mode === 'generate') {
            setPrompt(''); 
        }
    };

    const handleGenerateEdit = useCallback(async (actionPrompt: string, actionImages?: ImageFile[], actionMask?: ImageFile) => {
        if (images.length === 0) {
            reportError({ message: 'Missing Image Input: Please upload a photo to proceed.' }, 'VALIDATION_ERROR');
            return;
        }
        if (!actionPrompt.trim()) {
            reportError({ message: 'Empty Prompt: Describe the changes you want to make.' }, 'VALIDATION_ERROR');
            return;
        }

        setIsLoading(true);
        setError(null);
        setAnalysisResult(null);

        const combinedPrompt = `${actionPrompt}${negativePrompt ? ` NEGATIVE PROMPT: Do not include the following: ${negativePrompt}.` : ''} Output quality should be: ${resolution}.`;

        try {
            if (editMode === 'batch') {
                const concurrencyLimit = 3;
                const initialBatch = images.map((img, i) => ({ id: `${i}-${Date.now()}`, status: 'queued' as const, originalUrl: img.url }));
                setBatchResults(initialBatch);

                const processItem = async (i: number) => {
                    setBatchResults(prev => prev.map((r, idx) => idx === i ? { ...r, status: 'processing' } : r));
                    const currentImageInput = { base64ImageData: images[i].base64, mimeType: images[i].mimeType };
                    
                    try {
                        const { editedImage } = await editImageWithNanoBanana([currentImageInput], combinedPrompt);
                        if (!editedImage) throw new Error("API::Result was empty.");
                        const resultUrl = `data:image/png;base64,${editedImage}`;
                        setBatchResults(prev => prev.map((r, idx) => idx === i ? { ...r, status: 'done', imageUrl: resultUrl } : r));
                    } catch (e: any) {
                         const errorMsg = e.message.split('::')[1] || 'Batch item failed.';
                         setBatchResults(prev => prev.map((r, idx) => idx === i ? { ...r, status: 'error', error: errorMsg } : r));
                    }
                };

                const queue = [...Array(images.length).keys()];
                const workers = [];
                for (let i = 0; i < Math.min(concurrencyLimit, images.length); i++) {
                    workers.push((async () => {
                        while (queue.length > 0) {
                            const itemIndex = queue.shift()!;
                            await processItem(itemIndex);
                        }
                    })());
                }
                await Promise.all(workers);
            } else { // Single mode
                const imageInputs = actionImages || images;
                const imageToProcess = imageInputs.map(img => ({ base64ImageData: img.base64, mimeType: img.mimeType }));
                const maskInput = actionMask ? { base64ImageData: actionMask.base64, mimeType: actionMask.mimeType } : undefined;

                const { editedImage } = await editImageWithNanoBanana(imageToProcess, combinedPrompt, maskInput);
                if (!editedImage) throw new Error("API::Model failed to produce an image result.");

                const newHistoryItem: EditHistoryItem = { imageUrl: `data:image/png;base64,${editedImage}`, prompt: actionPrompt, resolution, negativePrompt };
                setEditHistory(prev => {
                    const truncatedHistory = prev.slice(0, historyIndex + 1);
                    return [...truncatedHistory, newHistoryItem];
                });
                setHistoryIndex(prev => prev + 1);
            }
        } catch (e: any) {
            reportError(e, 'GENERIC_ERROR', () => handleGenerateEdit(actionPrompt, actionImages, actionMask), { prompt: actionPrompt });
        } finally {
            setIsLoading(false);
        }
    }, [images, negativePrompt, resolution, editMode, historyIndex, reportError]);

    const handleGenerateImage = useCallback(async () => {
        if (!prompt.trim()) {
            reportError({ message: 'Input Required: Provide a text description to generate an image.' }, 'VALIDATION_ERROR');
            return;
        }
        setIsLoading(true);
        setError(null);
        setAnalysisResult(null);

        try {
            const { editedImage: generatedImageBase64 } = await generateImageWithImagen(prompt, aspectRatio);
            if (!generatedImageBase64) throw new Error("API::Generation failed to return image data.");
            
            const imageUrl = `data:image/png;base64,${generatedImageBase64}`;
            const newImage: ImageFile = { url: imageUrl, base64: generatedImageBase64, mimeType: 'image/png' };
            
            setImages([newImage]);
            setEditHistory([]);
            setHistoryIndex(-1);
            setBatchResults([]);
            handleAppModeChange('edit');
            
        } catch (e: any) {
            reportError(e, 'GENERIC_ERROR', handleGenerateImage, { prompt, aspectRatio });
        } finally {
            setIsLoading(false);
        }
    }, [prompt, aspectRatio, reportError]);

    const handlePrimaryAction = () => {
        if (appMode === 'generate') {
            handleGenerateImage();
        } else {
            handleGenerateEdit(prompt);
        }
    };

    const handleQuickAction = useCallback(async (tool: { id: string, prompt?: string, title: string }) => {
        if (!tool.prompt && !tool.id.includes('Analysis') && !(tool.id in { 'magicErase':1, 'magicReplace':1, 'aiBackground':1, 'filters':1, 'crop':1, 'styleRemix':1, 'intelligentText':1, 'gifCreator':1 })) return;
        
        const modalId = tool.id as ActiveModal;

        if (['magicErase', 'magicReplace', 'aiBackground', 'filters', 'crop', 'styleRemix', 'intelligentText', 'gifCreator'].includes(modalId)) {
            setActiveModal(modalId);
        } else if (tool.prompt) {
            setPrompt(tool.prompt);
            handleGenerateEdit(tool.prompt);
        } else if (tool.id.includes('Analysis')) {
            if (!currentImage) return;

            setIsLoading(true);
            setError(null);
            setAnalysisResult(null);
            
            const isDeep = tool.id === 'deepAnalysis';
            const model = isDeep ? 'gemini-3-pro-preview' : 'gemini-2.5-flash';
            const analysisPrompt = isDeep 
                ? "Perform a professional Deep Analysis of this image. Discuss its technical composition, creative lighting choices, symbolic subject matter, and the likely emotional impact on viewers. Behave as an elite art critic providing an insightful, constructive, and detailed critique."
                : "Briefly describe the key subjects and mood of this image.";
            
            setAnalysisTitle(isDeep ? 'Deep Analysis' : 'Quick Analysis');
            
            try {
                const result = await analyzeImage(model, { base64ImageData: currentImage.base64, mimeType: currentImage.mimeType }, analysisPrompt, isDeep);
                setAnalysisResult(result);
            } catch(e: any) {
                reportError(e, 'GENERIC_ERROR', () => handleQuickAction(tool), { tool: tool.id });
            } finally {
                setIsLoading(false);
            }
        }
    }, [handleGenerateEdit, currentImage, reportError]);
    
    // --- Tool Modal Handlers ---
    const handleApplyMagicErase = useCallback((maskBase64: string) => {
        const prompt = "Remove the selected area defined by the user's mask. Infill the gap with a seamless background that matches textures, lighting, and perspective of the surrounding pixels.";
        handleGenerateEdit(prompt, [currentImage!], { url: '', base64: maskBase64, mimeType: 'image/png' });
        setActiveModal(null);
    }, [handleGenerateEdit, currentImage]);

    const handleApplyMagicReplace = useCallback((maskBase64: string, replacementPrompt: string) => {
        const prompt = `Replace the masked area with: '${replacementPrompt}'. Ensure the new object is integrated naturally with correct depth, shadows, and lighting.`;
        handleGenerateEdit(prompt, [currentImage!], { url: '', base64: maskBase64, mimeType: 'image/png' });
        setActiveModal(null);
    }, [handleGenerateEdit, currentImage]);

    const handleApplyAIBackground = useCallback((backgroundPrompt: string) => {
        const prompt = `Keep the main subjects perfectly intact and replace the background with a new scene: '${backgroundPrompt}'. Match the subject lighting to the new environment.`;
        handleGenerateEdit(prompt);
        setActiveModal(null);
    }, [handleGenerateEdit]);

    const handleApplyCrop = useCallback((croppedImageBase64: string) => {
        const newImageFile = { url: `data:image/png;base64,${croppedImageBase64}`, base64: croppedImageBase64, mimeType: 'image/png' };
        setImages([newImageFile]);
        setEditHistory([]);
        setHistoryIndex(-1);
        setActiveModal(null);
    }, []);
    
    const handleApplyAIAction = useCallback((prompt: string) => {
        handleGenerateEdit(prompt);
        setActiveModal(null);
    }, [handleGenerateEdit]);
    
    const handleApplyStyleRemix = useCallback((styleImage: ImageFile, remixPrompt: string) => {
        const prompt = `Apply the distinct artistic style of the reference image to the content image. ${remixPrompt ? `Refinement: '${remixPrompt}'.` : ''}`;
        handleGenerateEdit(prompt, [currentImage!, styleImage]);
        setActiveModal(null);
    }, [handleGenerateEdit, currentImage]);

    const handleApplyIntelligentText = useCallback((text: string, style: string, position: string) => {
        const prompt = `Inscribe the text "${text}" into the image using a '${style}' aesthetic. Position it based on '${position}' for optimal legibility and art integration.`;
        handleGenerateEdit(prompt);
        setActiveModal(null);
    }, [handleGenerateEdit]);
    
    const handleApplyGifCreator = useCallback((animationPrompt: string) => {
        const prompt = `Generate a sequence of 8 frames for a smooth looping animation: '${animationPrompt}'. Output as a single 1x8 horizontal filmstrip.`;
        handleGenerateEdit(prompt);
        setActiveModal(null);
    }, [handleGenerateEdit]);

    // --- History and Result Navigation ---
    const handleUndo = useCallback(() => {
        setHistoryIndex(prev => Math.max(-1, prev - 1));
    }, []);

    const handleRedo = useCallback(() => {
        setHistoryIndex(prev => {
            const maxIdx = editHistory.length - 1;
            return prev < maxIdx ? prev + 1 : prev;
        });
    }, [editHistory]);

    const handleReset = useCallback(() => {
        setEditHistory([]);
        setHistoryIndex(-1);
        setBatchResults([]);
        setAnalysisResult(null);
    }, []);

    const handleUseAsInput = useCallback(() => {
        if (!currentResult) return;
        const base64 = currentResult.split(',')[1];
        const newImage = { url: currentResult, base64, mimeType: 'image/png' };
        setImages([newImage]);
        setEditHistory([]);
        setHistoryIndex(-1);
        setBatchResults([]);
        setCurrentBatchIndex(0);
        setEditMode('single');
    }, [currentResult]);

    const handleDownload = useCallback(() => {
        if (!currentResult) return;
        const link = document.createElement('a');
        link.href = currentResult;
        link.download = `GlowMint-edit-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }, [currentResult]);
    
    // --- Effects ---
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            setIsTutorialOpen(true);
        }
    }, []);
    
     useEffect(() => {
        const handlePaste = async (event: ClipboardEvent) => {
            const items = event.clipboardData?.items;
            if (!items) return;

            const imageFiles: File[] = [];
            for (let i = 0; i < items.length; i++) {
                if (items[i].type.indexOf('image') !== -1) {
                    const file = items[i].getAsFile();
                    if (file) imageFiles.push(file);
                }
            }
            
            if (imageFiles.length > 0) {
                const newImages: ImageFile[] = await Promise.all(
                    imageFiles.map(file => {
                        return new Promise<ImageFile>((resolve, reject) => {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                                const url = reader.result as string;
                                const base64 = url.split(',')[1];
                                resolve({ url, base64, mimeType: file.type });
                            };
                            reader.onerror = reject;
                            reader.readAsDataURL(file);
                        });
                    })
                );
                handleAddImages(newImages);
            }
        };

        document.addEventListener('paste', handlePaste);
        return () => document.removeEventListener('paste', handlePaste);
    }, [handleAddImages]);

    useEffect(() => {
        if (appMode === 'edit') {
            if (images.length > 1 && editMode === 'single') {
                setEditMode('batch');
            } else if (images.length <= 1 && editMode === 'batch') {
                setEditMode('single');
            }
        }
    }, [images.length, editMode, appMode]);

    useEffect(() => {
        const checkCache = async () => {
            if (!currentImage || appMode !== 'edit') {
                setCachedResolutions(new Set());
                return;
            }
            const newCachedSet = new Set<Resolution>();
            const fullPrompt = `${prompt}${negativePrompt ? ` NEGATIVE PROMPT: Do not include the following: ${negativePrompt}.` : ''}`;
            for (const res of ['Low', 'Medium', 'High'] as Resolution[]) {
                const key = await createCacheKey([{ base64ImageData: currentImage.base64, mimeType: currentImage.mimeType }], `${fullPrompt} Output quality should be: ${res}.`);
                if (await cacheService.has(key)) {
                    newCachedSet.add(res);
                }
            }
            setCachedResolutions(newCachedSet);
        };
        checkCache();
    }, [currentImage, prompt, negativePrompt, appMode]);

    const renderModal = () => {
        if (!currentImage) return null;
        switch(activeModal) {
            case 'magicErase': return <MagicEraseModal image={currentImage} onClose={() => setActiveModal(null)} onApply={handleApplyMagicErase} />;
            case 'magicReplace': return <MagicReplaceModal image={currentImage} onClose={() => setActiveModal(null)} onApply={handleApplyMagicReplace} />;
            case 'aiBackground': return <AIBackgroundModal image={currentImage} onClose={() => setActiveModal(null)} onApply={handleApplyAIBackground} />;
            case 'filters': return <FiltersModal image={currentImage} onClose={() => setActiveModal(null)} onApply={(p) => { setPrompt(p); handleGenerateEdit(p); setActiveModal(null); }} />;
            case 'crop': return <CropModal image={currentImage} onClose={() => setActiveModal(null)} onApply={handleApplyCrop} onApplyAI={handleApplyAIAction}/>;
            case 'styleRemix': return <StyleRemixModal image={currentImage} onClose={() => setActiveModal(null)} onApply={handleApplyStyleRemix} />;
            case 'intelligentText': return <IntelligentTextModal image={currentImage} onClose={() => setActiveModal(null)} onApply={handleApplyIntelligentText} />;
            case 'gifCreator': return <GifCreatorModal image={currentImage} onClose={() => setActiveModal(null)} onApply={handleApplyGifCreator} />;
            default: return null;
        }
    };

    return (
    <div className="flex flex-col min-h-screen">
        <Header />
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">

            {/* --- Left Column: Controls --- */}
            <div className="flex flex-col gap-6">
                
                <div className="bg-[--color-surface-1] p-6 rounded-2xl shadow-lg border border-[--color-border]/50">
                    <div className="flex justify-between items-center mb-4">
                         <h2 className="text-xl font-bold text-[--color-text-primary]">{appMode === 'edit' ? '1. Upload Your Image(s)' : '1. Describe Your Image'}</h2>
                        <div className="flex items-center gap-2 bg-[--color-surface-2] p-1 rounded-full">
                             <button onClick={() => handleAppModeChange('edit')} className={`px-3 py-1 text-sm font-semibold rounded-full transition-colors ${appMode === 'edit' ? 'bg-[--color-surface-3] text-[--color-text-primary]' : 'text-[--color-text-tertiary]'}`}>Edit</button>
                             <button onClick={() => handleAppModeChange('generate')} className={`px-3 py-1 text-sm font-semibold rounded-full transition-colors ${appMode === 'generate' ? 'bg-[--color-surface-3] text-[--color-text-primary]' : 'text-[--color-text-tertiary]'}`}>Generate</button>
                        </div>
                    </div>
                    {appMode === 'edit' && <ImageUploader images={images} onAddImages={handleAddImages} onRemoveImage={handleRemoveImage} />}
                </div>
                
                <div className="bg-[--color-surface-1] p-6 rounded-2xl shadow-lg border border-[--color-border]/50">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-[--color-text-primary]">{appMode === 'edit' ? '2. Describe Your Edit' : '2. Set Your Parameters'}</h2>
                        {appMode === 'edit' && (
                        <div className="flex items-center gap-2 bg-[--color-surface-2] p-1 rounded-full">
                             <button onClick={() => setEditMode('single')} disabled={images.length > 1} className={`px-3 py-1 text-sm font-semibold rounded-full transition-colors ${editMode === 'single' ? 'bg-[--color-surface-3] text-[--color-text-primary]' : 'text-[--color-text-tertiary]'} disabled:opacity-50`}>Single</button>
                             <button onClick={() => setEditMode('batch')} disabled={images.length <= 1} className={`px-3 py-1 text-sm font-semibold rounded-full transition-colors ${editMode === 'batch' ? 'bg-[--color-surface-3] text-[--color-text-primary]' : 'text-[--color-text-tertiary]'} disabled:opacity-50`}>Batch</button>
                        </div>
                        )}
                    </div>
                    
                    <PromptInput
                        prompt={prompt}
                        setPrompt={setPrompt}
                        isDisabled={appMode === 'edit' && images.length === 0}
                        placeholder={appMode === 'generate' ? "e.g., a photorealistic portrait of an astronaut on a horse on Mars" : undefined}
                    />
                    
                    <div className="mt-4">
                        <button onClick={() => setIsAdvancedOpen(!isAdvancedOpen)} className="text-sm font-semibold text-[--color-text-tertiary] hover:text-[--color-text-primary]">
                            Advanced Options {isAdvancedOpen ? '▲' : '▼'}
                        </button>
                        {isAdvancedOpen && (
                            <div className="mt-3 animate-fade-in">
                                <PromptInput prompt={negativePrompt} setPrompt={setNegativePrompt} isDisabled={appMode === 'edit' && images.length === 0} rows={2} placeholder="Negative prompt: e.g., 'text, watermarks, ugly'"/>
                            </div>
                        )}
                    </div>
                    {appMode === 'edit' && <ResolutionSelector selectedResolution={resolution} onResolutionChange={setResolution} isDisabled={images.length === 0} cachedResolutions={cachedResolutions}/>}
                    {appMode === 'generate' && <AspectRatioSelector selectedRatio={aspectRatio} onRatioChange={setAspectRatio} isDisabled={false} />}
                </div>

                {appMode === 'edit' && (
                <div className="bg-[--color-surface-1] p-6 rounded-2xl shadow-lg border border-[--color-border]/50">
                    <h2 className="text-xl font-bold mb-4 text-[--color-text-primary]">Or, Use Quick Actions</h2>
                    <div className="space-y-4">
                      {toolSections.map(section => (
                        <div key={section.title}>
                          <h3 className="text-sm font-semibold text-[--color-text-tertiary] mb-2">{section.title}</h3>
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                            {section.tools.map(tool => (
                              <button
                                key={tool.id}
                                onClick={() => handleQuickAction(tool)}
                                disabled={images.length === 0 || ((section.title.includes('Interactive') || section.title.includes('Portrait') || section.title.includes('Insights')) && editMode === 'batch')}
                                className="p-2 bg-[--color-surface-2] hover:bg-[--color-surface-3] rounded-lg text-center transition-all duration-200 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                title={tool.title}
                              >
                                <span className="text-2xl" role="img" aria-label={tool.label}>{tool.emoji}</span>
                                <p className="text-xs font-semibold mt-1 text-[--color-text-secondary]">{tool.label}</p>
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                </div>
                )}

                <button onClick={handlePrimaryAction} disabled={isLoading || (appMode === 'edit' && images.length === 0) || !prompt} className="w-full py-4 text-lg font-bold bg-gradient-to-r from-[--color-primary] to-[--color-secondary] text-white rounded-xl shadow-lg hover:opacity-90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-[--color-primary-focus]/50">
                    {appMode === 'generate' ? '🎨 Generate Image' : '✨ Generate Edit'}
                </button>
            </div>
            
            {/* --- Right Column: Results --- */}
            <div className="flex flex-col gap-4 bg-[--color-surface-1] p-4 rounded-2xl shadow-lg border border-[--color-border]/50">
                <div className="flex-grow aspect-square min-h-0">
                    {error && !analysisResult && <div className="h-full flex items-center justify-center p-4"><ErrorDisplay error={error} /></div>}
                    {!error && analysisResult ? (
                         <TextDisplay text={analysisResult} title={analysisTitle} onClear={() => setAnalysisResult(null)} />
                    ) : ( !error && (
                        (viewMode === 'slider' && currentResult && currentImage) ? (
                            <ImageCompareSlider beforeImageUrl={currentImage.url} afterImageUrl={currentResult} />
                        ) : (viewMode === 'side-by-side' && currentResult && currentImage) ? (
                            <div className="grid grid-cols-2 gap-2 h-full p-2">
                                <div className="flex flex-col text-center">
                                    <h3 className="text-sm font-semibold mb-1 text-[--color-text-tertiary]">Original</h3>
                                    <div className="flex-grow min-h-0">
                                        <ImageDisplay imageUrl={currentImage.url} onViewFullscreen={setFullscreenImageUrl} />
                                    </div>
                                </div>
                                <div className="flex flex-col text-center">
                                    <h3 className="text-sm font-semibold mb-1 text-[--color-text-tertiary]">Edited</h3>
                                    <div className="flex-grow min-h-0">
                                        <ImageDisplay imageUrl={currentResult} onViewFullscreen={setFullscreenImageUrl} />
                                    </div>
                                </div>
                            </div>
                        ) : ( 
                             <ImageDisplay 
                                imageUrl={currentResult || currentImage?.url} 
                                originalImageUrl={currentImage?.url}
                                isLoading={isLoading && !currentResult} 
                                onViewFullscreen={setFullscreenImageUrl}
                            />
                        )
                    ))}
                </div>
                
                {/* --- Result Controls --- */}
                {(currentResult || batchResults.length > 0 || images.length > 0) && !error && !analysisResult && (
                    <div className="flex-shrink-0 flex flex-col sm:flex-row justify-between items-center gap-4 bg-[--color-surface-2] p-3 rounded-xl">
                        {editMode === 'batch' ? (
                            <div className="flex items-center gap-2">
                                <button onClick={() => setCurrentBatchIndex(i => Math.max(0, i - 1))} disabled={currentBatchIndex === 0} className="p-2 bg-[--color-surface-3] rounded-full disabled:opacity-50"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg></button>
                                <span className="text-sm font-semibold">{currentBatchIndex + 1} / {images.length}</span>
                                <button onClick={() => setCurrentBatchIndex(i => Math.min(images.length - 1, i + 1))} disabled={currentBatchIndex === images.length - 1} className="p-2 bg-[--color-surface-3] rounded-full disabled:opacity-50"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg></button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <button onClick={handleUndo} disabled={historyIndex < 0} className="p-2 bg-[--color-surface-3] rounded-md disabled:opacity-50" title="Undo"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 15l-3-3m0 0l3-3m-3 3h8a5 5 0 015 5v1" /></svg></button>
                                <button onClick={handleRedo} disabled={historyIndex >= editHistory.length - 1} className="p-2 bg-[--color-surface-3] rounded-md disabled:opacity-50" title="Redo"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 15l3-3m0 0l-3-3m3 3H8a5 5 0 00-5 5v1" /></svg></button>
                            </div>
                        )}

                        <div className="bg-[--color-surface-1] p-1 rounded-full flex items-center text-xs font-semibold">
                            <button onClick={() => setViewMode('toggle')} className={`px-3 py-1.5 rounded-full ${viewMode === 'toggle' ? 'bg-[--color-surface-3] text-[--color-text-primary]' : 'text-[--color-text-tertiary]'}`}>Toggle</button>
                            <button onClick={() => setViewMode('slider')} className={`px-3 py-1.5 rounded-full ${viewMode === 'slider' ? 'bg-[--color-surface-3] text-[--color-text-primary]' : 'text-[--color-text-tertiary]'}`}>Slider</button>
                            <button onClick={() => setViewMode('side-by-side')} className={`px-3 py-1.5 rounded-full ${viewMode === 'side-by-side' ? 'bg-[--color-surface-3] text-[--color-text-primary]' : 'text-[--color-text-tertiary]'}`}>Side-by-Side</button>
                        </div>

                        <div className="flex items-center gap-2">
                            <button onClick={handleReset} className="py-2 px-3 bg-[--color-surface-3] text-[--color-text-primary] font-bold rounded-lg text-sm flex items-center gap-2" title="Reset all edits"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M20 20v-5h-5M4 4l16 16" /></svg></button>
                            <button onClick={handleUseAsInput} disabled={!currentResult} className="py-2 px-3 bg-[--color-primary] text-[--color-primary-text] font-bold rounded-lg text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed" title="Use this result as the next input image"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 110 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" /></svg></button>
                            <button onClick={handleDownload} disabled={!currentResult} className="py-2 px-3 bg-[--color-success] hover:bg-[--color-success-hover] text-white font-bold rounded-lg text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg><span>Download</span></button>
                        </div>
                    </div>
                )}
            </div>

        </div>
        </main>
        <Footer onOpenTutorial={() => setIsTutorialOpen(true)} />

        {/* --- Overlays and Modals --- */}
        {isLoading && <LoadingOverlay />}
        {fullscreenImageUrl && <FullscreenModal imageUrl={fullscreenImageUrl} onClose={() => setFullscreenImageUrl(null)} />}
        {isTutorialOpen && <TutorialModal onClose={() => setIsTutorialOpen(false)} />}
        {activeModal && renderModal()}
    </div>
    );
};

export default App;
