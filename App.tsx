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
import { editImageWithNanoBanana } from './services/geminiService';
import type { ImageFile } from './types';
import MagicReplaceModal from './components/MagicReplaceModal';
import AIBackgroundModal from './components/AIBackgroundModal';
import FiltersModal from './components/FiltersModal';
import { CropModal } from './components/CropModal';
import StyleRemixModal from './components/StyleRemixModal';
import IntelligentTextModal from './components/IntelligentTextModal';
import GifCreatorModal from './components/GifCreatorModal';
import { createCacheKey, cacheService } from './services/cacheService';

// --- Types ---
type AppError = { code: 'INVALID_KEY' | 'QUOTA_EXCEEDED' | 'GENERIC_ERROR' | 'VALIDATION_ERROR'; message: string; };
type Resolution = 'Low' | 'Medium' | 'High';
type EditMode = 'single' | 'batch';
type ViewMode = 'toggle' | 'slider' | 'side-by-side';
type ActiveModal = 'magicErase' | 'magicReplace' | 'aiBackground' | 'filters' | 'crop' | 'styleRemix' | 'intelligentText' | 'gifCreator' | null;
type BatchStatus = 'queued' | 'processing' | 'done' | 'error';
type BatchResult = { id: string; status: BatchStatus; imageUrl?: string; error?: string; originalUrl: string; };
type EditHistoryItem = { imageUrl: string; prompt: string; resolution: Resolution; negativePrompt: string; };

// --- Error Display Component ---
const errorDetailsMap: Record<AppError['code'], { emoji: string; title: string; borderColor: string; bgColor: string; textColor: string; }> = {
  INVALID_KEY: { emoji: '🔑', title: 'API Key Issue', borderColor: 'border-[--color-warning-border]', bgColor: 'bg-[--color-warning-bg]/50', textColor: 'text-[--color-warning-text]', },
  QUOTA_EXCEEDED: { emoji: '⏳', title: 'Quota Reached', borderColor: 'border-[--color-quota-border]', bgColor: 'bg-[--color-quota-bg]/50', textColor: 'text-[--color-quota-text]', },
  GENERIC_ERROR: { emoji: '🤖', title: 'Oops! Something went wrong', borderColor: 'border-[--color-error-border]', bgColor: 'bg-[--color-error-bg]/50', textColor: 'text-[--color-error-text]', },
  VALIDATION_ERROR: { emoji: '🖼️', title: 'Input Needed', borderColor: 'border-[--color-info-border]', bgColor: 'bg-[--color-info-bg]/50', textColor: 'text-[--color-info-text]', },
};

const ErrorDisplay: React.FC<{ error: AppError | null }> = ({ error }) => {
  if (!error) return null;
  const details = errorDetailsMap[error.code] || errorDetailsMap.GENERIC_ERROR;
  return (
    <div className={`p-4 rounded-2xl text-center animate-fade-in border-2 ${details.borderColor} ${details.bgColor} ${details.textColor} flex flex-col items-center gap-3 shadow-lg`} role="alert">
      <div className="text-4xl animate-bounce">{details.emoji}</div>
      <div>
        <p className="font-bold text-lg">{details.title}</p>
        <p className="text-sm mt-1">{error.message}</p>
      </div>
    </div>
  );
};

// --- Tool Definitions ---
const toolSections = [
    {
        title: 'AI Enhance & Fix',
        tools: [
            { id: 'enhance', label: 'Enhance', emoji: '🚀', title: 'Automatically enhance a single image', prompt: "Enhance this image. Increase the resolution, remove noise and artifacts, and sharpen the details to make it look like a high-quality, clear photograph. Do not change the content or composition of the image." },
            { id: 'autoFix', label: 'Auto Fix', emoji: '💡', title: 'Automatically fix lighting and color', prompt: "Automatically analyze this photo and adjust the brightness, contrast, shadows, highlights, and color balance to create a well-exposed and visually pleasing image. The goal is a natural-looking improvement, not an overly stylized effect." },
            { id: 'restorePhoto', label: 'Restore', emoji: '🔧', title: 'Restore old, damaged, or faded photos', prompt: "Restore this photo. Remove any scratches, tears, dust, and blemishes. Correct fading and color shifts to bring back the original vibrancy and clarity. Sharpen details where they have been softened by age, but maintain the photo's authentic character." },
            { id: 'upscale', label: 'Upscale', emoji: '📈', title: 'Increase image resolution with AI', prompt: "Upscale this image to a higher resolution. Intelligently enhance details, sharpen edges, and remove compression artifacts to create a crisp, clear, high-quality version. Do not change the content or composition of the image." },
        ]
    },
    {
        title: 'Creative Tools',
        tools: [
            { id: 'colorize', label: 'Colorize', emoji: '🎨', title: 'Colorize a single black and white photo', prompt: "Colorize this black and white photo, making the colors realistic and vibrant." },
            { id: 'removeBg', label: 'Remove BG', emoji: '✂️', title: 'Remove the background', prompt: "Isolate the main subject of this image and make the background solid white. Ensure the edges of the subject are clean and sharp." },
            { id: 'replaceSky', label: 'Replace Sky', emoji: '☁️', title: 'Replace the sky with a beautiful new one', prompt: 'Realistically replace the sky in this image with a beautiful, dramatic, and partly cloudy blue sky. Ensure the lighting on the rest of the image is adjusted to match the new sky for a seamless and natural look.' },
            { id: 'colorSplash', label: 'Color Pop', emoji: '🎯', title: 'Make the main subject color, background B&W', prompt: "Identify the main subject of this image. Convert the entire image to black and white, except for the main subject, which should retain its original, vibrant colors." },
            { id: '3dPhoto', label: '3D Effect', emoji: '🧊', title: 'Create a 3D parallax effect filmstrip', prompt: "Analyze the image to create a 3D photo effect. Generate a short, 8-frame filmstrip that creates a subtle parallax motion, giving the illusion of depth. The background should move slightly slower than the foreground subject. The final result should be a single image containing all 8 frames arranged horizontally in a row." }
        ]
    },
    {
        title: 'Artistic Styles',
        tools: [
            { id: 'sketch', label: 'Sketch', emoji: '✏️', title: 'Convert the photo to a pencil sketch', prompt: "Convert this image into a detailed pencil sketch. The lines should be clean and the shading should be realistic, capturing the forms and textures of the original photo. The background should be a clean white paper texture." },
            { id: 'cartoon', label: 'Cartoon', emoji: '🤩', title: 'Turn the photo into a cartoon', prompt: "Transform this photo into a vibrant cartoon. Use bold outlines, simplified shapes, and bright, flat colors. The style should be fun and exaggerated, like a modern animated movie." },
            { id: 'impressionism', label: 'Impressionist', emoji: '🧑‍🎨', title: 'Recreate in an impressionistic painting style', prompt: "Recreate this image in the style of an Impressionist painting. Use short, thick brushstrokes, emphasize the play of light, and use a vibrant color palette to capture the feeling of the moment." },
            { id: 'pixelArt', label: 'Pixel Art', emoji: '👾', title: 'Convert the image to pixel art', prompt: "Convert this image into 16-bit pixel art. Use a limited color palette and simplify the details into clear, blocky pixels. The final result should look like it's from a classic video game." },
            { id: 'comicBook', label: 'Comic Book', emoji: '💥', title: 'Turn the photo into a comic book panel', prompt: "Transform this photo into a panel from a modern comic book. Apply a halftone dot pattern for shading, use bold, clean ink-like outlines, and a vibrant, high-contrast color palette. The result should look dynamic and action-packed." },
            { id: 'lineArt', label: 'Line Art', emoji: '✒️', title: 'Convert photo to black & white line art', prompt: "Convert this photo into a clean, high-quality black and white line art drawing. Trace the main contours and important details with precise, smooth lines. The background should be completely white. Do not include any shading, just the outlines." }
        ]
    },
    {
        title: 'Portrait Touch-up',
        tools: [
            { id: 'smoothSkin', label: 'Smooth Skin', emoji: '✨', title: 'Subtly smooth skin on faces', prompt: "Analyze the image for any faces. If a face is present, apply a subtle skin smoothing effect. Reduce the appearance of minor wrinkles and unevenness, but preserve natural skin texture to avoid a plastic look. If no face is detected, make no changes to the image." },
            { id: 'removeBlemishes', label: 'Blemish Fix', emoji: '🧼', title: 'Remove minor skin blemishes', prompt: "Analyze the image for any faces. If a face is present, identify and remove small blemishes, pimples, and spots from the skin. The correction should be seamless and preserve the surrounding skin texture. If no face is detected, do not alter the image." },
            { id: 'brightenEyes', label: 'Brighten Eyes', emoji: '👀', title: 'Make eyes more vibrant', prompt: "Analyze the image for any faces. If a face is detected, subtly brighten the eyes. Increase the brightness and saturation of the irises slightly and add a small, crisp highlight to make them appear more vibrant and full of life, without looking unnatural. If no face is detected, make no changes." },
            { id: 'whitenTeeth', label: 'Whiten Teeth', emoji: '😁', title: 'Gently whiten teeth in smiles', prompt: "Analyze the image for any faces with visible smiles. If present, gently whiten the teeth to a natural, healthy shade. Avoid an overly bright, artificial look. If no smiling faces with visible teeth are detected, do not alter the image." },
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
    const [editMode, setEditMode] = useState<EditMode>('single');

    // Result and history state
    const [editHistory, setEditHistory] = useState<EditHistoryItem[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const [batchResults, setBatchResults] = useState<BatchResult[]>([]);
    const [currentBatchIndex, setCurrentBatchIndex] = useState(0);

    // UI/Modal state
    const [fullscreenImageUrl, setFullscreenImageUrl] = useState<string | null>(null);
    const [isTutorialOpen, setIsTutorialOpen] = useState(false);
    const [activeModal, setActiveModal] = useState<ActiveModal>(null);
    const [viewMode, setViewMode] = useState<ViewMode>('toggle');
    const [isShowingOriginal, setIsShowingOriginal] = useState(false);
    const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

    const currentImage = useMemo(() => (editMode === 'single' ? images[0] : images[currentBatchIndex]), [editMode, images, currentBatchIndex]);
    const currentResult = useMemo(() => {
        if (editMode === 'single' && historyIndex >= 0) return editHistory[historyIndex].imageUrl;
        if (editMode === 'batch' && batchResults[currentBatchIndex]?.status === 'done') return batchResults[currentBatchIndex].imageUrl;
        return null;
    }, [editMode, historyIndex, editHistory, batchResults, currentBatchIndex]);

    // --- Handlers ---
    const handleAddImages = useCallback((newImages: ImageFile[]) => {
        setImages(prev => [...prev, ...newImages]);
        setError(null);
    }, []);

    const handleRemoveImage = useCallback((index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    }, []);

    const handleGenerate = useCallback(async (actionPrompt: string, actionImages?: ImageFile[], actionMask?: ImageFile) => {
        if (images.length === 0) {
            setError({ code: 'VALIDATION_ERROR', message: 'Please upload at least one image to edit.' });
            return;
        }
        if (!actionPrompt.trim()) {
            setError({ code: 'VALIDATION_ERROR', message: 'Please provide a prompt describing the edit you want.' });
            return;
        }

        setIsLoading(true);
        setError(null);

        const combinedPrompt = `${actionPrompt}${negativePrompt ? ` NEGATIVE PROMPT: Do not include the following: ${negativePrompt}.` : ''} Output quality should be: ${resolution}.`;

        const imageInputs = actionImages || images;
        const imageToProcess = imageInputs.map(img => ({ base64ImageData: img.base64, mimeType: img.mimeType }));
        const maskInput = actionMask ? { base64ImageData: actionMask.base64, mimeType: actionMask.mimeType } : undefined;

        try {
            if (editMode === 'batch') {
                setBatchResults(images.map((img, i) => ({ id: `${i}-${Date.now()}`, status: 'queued', originalUrl: img.url })));
                const results: BatchResult[] = [];
                for (let i = 0; i < images.length; i++) {
                    const currentImageInput = { base64ImageData: images[i].base64, mimeType: images[i].mimeType };
                    setBatchResults(prev => prev.map((r, idx) => idx === i ? { ...r, status: 'processing' } : r));
                    try {
                        const { editedImage } = await editImageWithNanoBanana([currentImageInput], combinedPrompt);
                        if (!editedImage) throw new Error("No image was returned from the API.");
                        results.push({ id: `${i}-${Date.now()}`, status: 'done', imageUrl: `data:image/png;base64,${editedImage}`, originalUrl: images[i].url });
                    } catch (e: any) {
                        const errorMessage = e.message.split('::')[1] || 'Generation failed.';
                        results.push({ id: `${i}-${Date.now()}`, status: 'error', error: errorMessage, originalUrl: images[i].url });
                    }
                    setBatchResults([...results, ...Array(images.length - results.length).fill({ status: 'queued' })]);
                }
            } else { // Single mode
                const { editedImage } = await editImageWithNanoBanana(imageToProcess, combinedPrompt, maskInput);
                if (!editedImage) throw new Error("No image was returned from the API.");

                const newHistoryItem: EditHistoryItem = { imageUrl: `data:image/png;base64,${editedImage}`, prompt: actionPrompt, resolution, negativePrompt };
                setEditHistory(prev => [...prev.slice(0, historyIndex + 1), newHistoryItem]);
                setHistoryIndex(prev => prev + 1);
            }
        } catch (e: any) {
            const [code, message] = (e.message as string).split('::');
            setError({ code: (code as AppError['code']) || 'GENERIC_ERROR', message: message || 'An unknown error occurred.' });
        } finally {
            setIsLoading(false);
        }
    }, [images, negativePrompt, resolution, editMode, historyIndex]);

    const handleQuickAction = useCallback((prompt?: string, modal?: ActiveModal) => {
        if (!prompt && !modal) return;
        if (modal) {
            setActiveModal(modal);
        } else if (prompt) {
            setPrompt(prompt);
            handleGenerate(prompt);
        }
    }, [handleGenerate]);
    
    // --- Tool Modal Handlers ---
    const handleApplyMagicErase = useCallback((maskBase64: string) => {
        const prompt = "The user has provided a mask. Using the mask as a guide, remove the selected object or area from the image. Fill in the space with a realistic background that seamlessly matches the surrounding environment. Ensure the transition is smooth and unnoticeable.";
        handleGenerate(prompt, [currentImage!], { url: '', base64: maskBase64, mimeType: 'image/png' });
        setActiveModal(null);
    }, [handleGenerate, currentImage]);

    const handleApplyMagicReplace = useCallback((maskBase64: string, replacementPrompt: string) => {
        const prompt = `The user has provided a mask and a replacement prompt. In the masked area, replace the content with: '${replacementPrompt}'. Ensure the replacement is seamlessly integrated with the rest of the image, matching lighting, shadows, and perspective.`;
        handleGenerate(prompt, [currentImage!], { url: '', base64: maskBase64, mimeType: 'image/png' });
        setActiveModal(null);
    }, [handleGenerate, currentImage]);

    const handleApplyAIBackground = useCallback((backgroundPrompt: string) => {
        const prompt = `Isolate the main subject of this image and replace the background with a new, AI-generated scene based on the following description: '${backgroundPrompt}'. The new background should be realistic and the lighting on the subject should be adjusted to match the new scene.`;
        handleGenerate(prompt);
        setActiveModal(null);
    }, [handleGenerate]);

    const handleApplyCrop = useCallback((croppedImageBase64: string) => {
        const newImageFile = { url: `data:image/png;base64,${croppedImageBase64}`, base64: croppedImageBase64, mimeType: 'image/png' };
        setImages([newImageFile]);
        setEditHistory([]);
        setHistoryIndex(-1);
        setActiveModal(null);
    }, []);
    
    const handleApplyAIAction = useCallback((prompt: string) => {
        handleGenerate(prompt);
        setActiveModal(null);
    }, [handleGenerate]);
    
    const handleApplyStyleRemix = useCallback((styleImage: ImageFile, remixPrompt: string) => {
        const prompt = `Analyze the style of the second image provided (the style reference) and apply that artistic style to the first image (the content image). ${remixPrompt ? `Specifically, focus on this aspect: '${remixPrompt}'.` : 'Transfer the overall color palette, texture, and composition style.'}`;
        handleGenerate(prompt, [currentImage!, styleImage]);
        setActiveModal(null);
    }, [handleGenerate, currentImage]);

    const handleApplyIntelligentText = useCallback((text: string, style: string, position: string) => {
        const prompt = `Add the following text to the image: "${text}". The text should be in a '${style}' style. Analyze the image content and composition to determine the best placement for the text, taking the user's suggestion of '${position}' into account. The text should be seamlessly integrated and aesthetically pleasing.`;
        handleGenerate(prompt);
        setActiveModal(null);
    }, [handleGenerate]);
    
    const handleApplyGifCreator = useCallback((animationPrompt: string) => {
        const prompt = `Create an 8-frame filmstrip that represents a short, looping animation based on the following description: '${animationPrompt}'. The first frame should be the original image. The subsequent 7 frames should show a smooth progression of the animation. The final result should be a single image containing all 8 frames arranged horizontally in a row.`;
        handleGenerate(prompt);
        setActiveModal(null);
    }, [handleGenerate]);

    // --- History and Result Navigation ---
    const handleUndo = useCallback(() => setHistoryIndex(i => Math.max(0, i - 1)), []);
    const handleRedo = useCallback(() => setHistoryIndex(i => Math.min(editHistory.length - 1, i + 1)), [editHistory.length]);

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
        if (images.length > 1 && editMode === 'single') {
            setEditMode('batch');
        } else if (images.length <= 1 && editMode === 'batch') {
            setEditMode('single');
        }
    }, [images.length, editMode]);

    useEffect(() => {
        const checkCache = async () => {
            if (!currentImage) {
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
    }, [currentImage, prompt, negativePrompt]);

    const renderModal = () => {
        if (!currentImage) return null;
        switch(activeModal) {
            case 'magicErase': return <MagicEraseModal image={currentImage} onClose={() => setActiveModal(null)} onApply={handleApplyMagicErase} />;
            case 'magicReplace': return <MagicReplaceModal image={currentImage} onClose={() => setActiveModal(null)} onApply={handleApplyMagicReplace} />;
            case 'aiBackground': return <AIBackgroundModal image={currentImage} onClose={() => setActiveModal(null)} onApply={handleApplyAIBackground} />;
            case 'filters': return <FiltersModal image={currentImage} onClose={() => setActiveModal(null)} onApply={(p) => { setPrompt(p); handleGenerate(p); setActiveModal(null); }} />;
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
                    <h2 className="text-xl font-bold mb-4 text-[--color-text-primary]">1. Upload Your Image(s)</h2>
                    <ImageUploader images={images} onAddImages={handleAddImages} onRemoveImage={handleRemoveImage} />
                </div>
                
                <div className="bg-[--color-surface-1] p-6 rounded-2xl shadow-lg border border-[--color-border]/50">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-[--color-text-primary]">2. Describe Your Edit</h2>
                        <div className="flex items-center gap-2 bg-[--color-surface-2] p-1 rounded-full">
                             <button onClick={() => setEditMode('single')} disabled={images.length > 1} className={`px-3 py-1 text-sm font-semibold rounded-full transition-colors ${editMode === 'single' ? 'bg-[--color-surface-3] text-[--color-text-primary]' : 'text-[--color-text-tertiary]'} disabled:opacity-50`}>Single</button>
                             <button onClick={() => setEditMode('batch')} disabled={images.length <= 1} className={`px-3 py-1 text-sm font-semibold rounded-full transition-colors ${editMode === 'batch' ? 'bg-[--color-surface-3] text-[--color-text-primary]' : 'text-[--color-text-tertiary]'} disabled:opacity-50`}>Batch</button>
                        </div>
                    </div>
                    
                    <PromptInput prompt={prompt} setPrompt={setPrompt} isDisabled={images.length === 0} />
                    
                    <div className="mt-4">
                        <button onClick={() => setIsAdvancedOpen(!isAdvancedOpen)} className="text-sm font-semibold text-[--color-text-tertiary] hover:text-[--color-text-primary]">
                            Advanced Options {isAdvancedOpen ? '▲' : '▼'}
                        </button>
                        {isAdvancedOpen && (
                            <div className="mt-3 animate-fade-in">
                                <PromptInput prompt={negativePrompt} setPrompt={setNegativePrompt} isDisabled={images.length === 0} rows={2} placeholder="Negative prompt: e.g., 'text, watermarks, ugly'"/>
                            </div>
                        )}
                    </div>

                    <ResolutionSelector selectedResolution={resolution} onResolutionChange={setResolution} isDisabled={images.length === 0} cachedResolutions={cachedResolutions}/>
                </div>

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
                                onClick={() => handleQuickAction(tool.prompt, tool.prompt ? undefined : tool.id as ActiveModal)}
                                disabled={images.length === 0 || ((section.title.includes('Interactive') || section.title.includes('Portrait')) && editMode === 'batch')}
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

                <button onClick={() => handleGenerate(prompt)} disabled={isLoading || images.length === 0 || !prompt} className="w-full py-4 text-lg font-bold bg-gradient-to-r from-[--color-primary] to-[--color-secondary] text-white rounded-xl shadow-lg hover:opacity-90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-[--color-primary-focus]/50">
                    ✨ Generate
                </button>
            </div>
            
            {/* --- Right Column: Results --- */}
            <div className="flex flex-col gap-4 bg-[--color-surface-1] p-4 rounded-2xl shadow-lg border border-[--color-border]/50">
                <div className="flex-grow aspect-square min-h-0">
                    {error && <div className="h-full flex items-center justify-center p-4"><ErrorDisplay error={error} /></div>}
                    {!error && (
                        (viewMode === 'slider' && currentResult && currentImage) ? (
                            <ImageCompareSlider beforeImageUrl={currentImage.url} afterImageUrl={currentResult} />
                        ) : (
                             <ImageDisplay imageUrl={isShowingOriginal ? currentImage?.url ?? null : currentResult} isLoading={isLoading && !currentResult} onViewFullscreen={setFullscreenImageUrl}/>
                        )
                    )}
                </div>
                
                {/* --- Result Controls --- */}
                {(currentResult || batchResults.length > 0) && !error && (
                    <div className="flex-shrink-0 flex flex-col sm:flex-row justify-between items-center gap-4 bg-[--color-surface-2] p-3 rounded-xl">
                        {editMode === 'batch' ? (
                            <div className="flex items-center gap-2">
                                <button onClick={() => setCurrentBatchIndex(i => Math.max(0, i - 1))} disabled={currentBatchIndex === 0} className="p-2 bg-[--color-surface-3] rounded-full disabled:opacity-50"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg></button>
                                <span className="text-sm font-semibold">{currentBatchIndex + 1} / {images.length}</span>
                                <button onClick={() => setCurrentBatchIndex(i => Math.min(images.length - 1, i + 1))} disabled={currentBatchIndex === images.length - 1} className="p-2 bg-[--color-surface-3] rounded-full disabled:opacity-50"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg></button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <button onClick={handleUndo} disabled={historyIndex <= 0} className="p-2 bg-[--color-surface-3] rounded-md disabled:opacity-50" title="Undo"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 15l-3-3m0 0l3-3m-3 3h8a5 5 0 015 5v1" /></svg></button>
                                <button onClick={handleRedo} disabled={historyIndex >= editHistory.length - 1} className="p-2 bg-[--color-surface-3] rounded-md disabled:opacity-50" title="Redo"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 15l3-3m0 0l-3-3m3 3H8a5 5 0 00-5 5v1" /></svg></button>
                            </div>
                        )}

                        <div className="bg-[--color-surface-1] p-1 rounded-full flex items-center text-xs font-semibold">
                            <button onClick={() => { setViewMode('toggle'); setIsShowingOriginal(false); }} className={`px-3 py-1.5 rounded-full ${viewMode === 'toggle' ? 'bg-[--color-surface-3] text-[--color-text-primary]' : 'text-[--color-text-tertiary]'}`}>Toggle</button>
                            <button onClick={() => setViewMode('slider')} className={`px-3 py-1.5 rounded-full ${viewMode === 'slider' ? 'bg-[--color-surface-3] text-[--color-text-primary]' : 'text-[--color-text-tertiary]'}`}>Slider</button>
                        </div>

                        <div className="flex items-center gap-2">
                            <button onClick={handleUseAsInput} className="py-2 px-3 bg-[--color-primary] text-[--color-primary-text] font-bold rounded-lg text-sm flex items-center gap-2" title="Use this result as the next input image"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 110 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" /></svg></button>
                            <button onClick={handleDownload} className="py-2 px-3 bg-[--color-success] hover:bg-[--color-success-hover] text-white font-bold rounded-lg text-sm flex items-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg><span>Download</span></button>
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