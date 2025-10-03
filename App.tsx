
import React, { useState, useCallback, useMemo } from 'react';
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
import CropModal from './components/CropModal';
import StyleRemixModal from './components/StyleRemixModal';

// --- New Error Display Component ---
interface AppError {
  code: 'INVALID_KEY' | 'QUOTA_EXCEEDED' | 'GENERIC_ERROR' | 'VALIDATION_ERROR';
  message: string;
}

const errorDetailsMap: Record<AppError['code'], { emoji: string; title: string; borderColor: string; bgColor: string; textColor: string; }> = {
  INVALID_KEY: {
    emoji: '🔑',
    title: 'API Key Issue',
    borderColor: 'border-yellow-500/80',
    bgColor: 'bg-yellow-900/50',
    textColor: 'text-yellow-200',
  },
  QUOTA_EXCEEDED: {
    emoji: '⏳',
    title: 'Quota Reached',
    borderColor: 'border-orange-500/80',
    bgColor: 'bg-orange-900/50',
    textColor: 'text-orange-200',
  },
  GENERIC_ERROR: {
    emoji: '🤖',
    title: 'Oops! Something went wrong',
    borderColor: 'border-red-600/80',
    bgColor: 'bg-red-900/50',
    textColor: 'text-red-200',
  },
  VALIDATION_ERROR: {
    emoji: '🖼️',
    title: 'Input Needed',
    borderColor: 'border-teal-500/80',
    bgColor: 'bg-teal-900/50',
    textColor: 'text-teal-200',
  },
};

const ErrorDisplay: React.FC<{ error: AppError }> = ({ error }) => {
  const details = errorDetailsMap[error.code] || errorDetailsMap.GENERIC_ERROR;

  return (
    <div 
      className={`p-4 rounded-2xl text-center animate-fade-in border-2 ${details.borderColor} ${details.bgColor} ${details.textColor} flex flex-col items-center gap-3 shadow-lg`}
      role="alert"
    >
      <div className="text-4xl animate-bounce">{details.emoji}</div>
      <div>
        <p className="font-bold text-lg">{details.title}</p>
        <p className="text-sm mt-1">{error.message}</p>
      </div>
    </div>
  );
};

// --- Batch Result Types ---
type BatchStatus = 'queued' | 'processing' | 'done' | 'error';
interface BatchResult {
    status: BatchStatus;
    imageUrl?: string;
    error?: string;
    originalUrl: string;
}

const examplePrompts = [
  'combine these into a surreal collage',
  'place the subject from the first photo into the background of the second',
  'create a diptych with a clean dividing line',
  'blend these images together with a watercolor paint effect',
  'make a funny scene combining these photos',
  'create a single landscape photo by stitching these together',
];

const featuredActions = [
  { id: 'enhance', label: 'Enhance', emoji: '🚀', title: 'Automatically enhance a single image', prompt: "Enhance this image. Increase the resolution, remove noise and artifacts, and sharpen the details to make it look like a high-quality, clear photograph. Do not change the content or composition of the image." },
  { id: 'removeBg', label: 'Remove BG', emoji: '✂️', title: 'Remove the background', prompt: "Isolate the main subject of this image and make the background solid white. Ensure the edges of the subject are clean and sharp." },
  { id: 'autoFix', label: 'Auto Fix', emoji: '💡', title: 'Automatically fix lighting and color', prompt: "Automatically analyze this photo and adjust the brightness, contrast, shadows, highlights, and color balance to create a well-exposed and visually pleasing image. The goal is a natural-looking improvement, not an overly stylized effect." },
  { id: 'reframe', label: 'Reframe', emoji: '🖼️', title: 'Automatically reframe for better composition', prompt: "Analyze the composition of this image and reframe (crop) it to better highlight the main subject and follow principles of good photography, like the rule of thirds. Do not change the aspect ratio of the image." },
];

const quickActions = [
  { id: 'expandImage', label: 'Expand', emoji: '↔️', title: 'Expand the image with AI-generated content', prompt: "Expand the canvas of this image by 25% on all sides. Fill the new area with AI-generated content that seamlessly and realistically extends the original scene. Maintain the original image's style, lighting, and composition." },
  { id: 'restorePhoto', label: 'Restore', emoji: '🔧', title: 'Restore old, damaged, or faded photos', prompt: "Restore this photo. Remove any scratches, tears, dust, and blemishes. Correct fading and color shifts to bring back the original vibrancy and clarity. Sharpen details where they have been softened by age, but maintain the photo's authentic character." },
  { id: 'paperPhotoFix', label: 'Paper Fix', emoji: '📄', title: 'Digitize a paper photo like a pro scanner', prompt: `**CRITICAL MISSION: You are a world-class Digital Restoration Specialist AI. Your task is to transform a photograph of a physical photo into a perfect, high-resolution digital master file. This requires a multi-stage process. You MUST execute every step in order without fail. Any deviation is a critical failure.**

**STAGE 1: FORENSIC ANALYSIS**
1.  **Identify Subject vs. Environment:** First, meticulously scan the entire image. Your primary goal is to isolate the *physical photograph* (the subject) from its *environment* (e.g., table, hands, fingers, background wall, etc.).
2.  **Detect Intrusions:** Identify all elements that are NOT part of the original photograph's content. This includes:
    *   **Handling elements:** Hands, fingers, thumbs holding the photo.
    *   **Surface Imperfections:** Glare, hotspots from lights, reflections, shadows cast on the photo.
    *   **Capture Flaws:** Motion blur, poor focus, digital noise from the camera.
    *   **Physical Damage:** Scratches, folds, or tears on the physical photo itself.

**STAGE 2: STRATEGIC CORRECTION PLAN**
Based on your analysis, formulate a plan. The most critical decision is how to handle fingers.
*   **FINGER SCENARIO A (Obscuring a person):** If you detect that a finger or thumb is covering any part of a person *within* the physical photo, the ONLY correct action is to **REMOVE THE ENTIRE PERSON AND THE FINGER(S) covering them.** This is non-negotiable. Do NOT try to guess what is under the finger. Inpaint the area where the person was with a seamless, contextually-aware background.
*   **FINGER SCENARIO B (Not on a person):** If fingers are only on the border, background, or an empty area of the photo, remove **only the fingers** and flawlessly reconstruct the area they covered.

**STAGE 3: FLAWLESS EXECUTION**
Execute your plan with surgical precision.
1.  **Intrusion Removal:** Act on your finger strategy from Stage 2. Simultaneously, **aggressively eliminate ALL reflections, glare, and shadows** from the photo's surface. The lighting on the final image must be perfectly even and neutral.
2.  **Geometric Perfection:**
    *   Identify the absolute, true edges of the paper photograph.
    *   Correct all perspective distortion (keystoning) so the photo is a perfect rectangle.
    *   Crop the image to these precise edges, removing 100% of the surrounding environment. The output must contain ONLY the photo's content.
3.  **Quality Enhancement:**
    *   Correct all motion blur and focus issues to make the image tack sharp.
    *   Restore faded colors to their original vibrancy.
    *   Increase the overall resolution and clarity, adding realistic detail where needed.
    *   Remove any digital noise.

**STAGE 4: FINAL VERIFICATION**
Before outputting, review your work against this checklist:
*   [ ] Is the image a perfect rectangle? (No perspective distortion)
*   [ ] Is 100% of the background environment (table, hands, etc.) gone?
*   [ ] Are ALL fingers and thumbs gone?
*   [ ] Are ALL traces of glare, reflections, and shadows gone?
*   [ ] Is the lighting perfectly uniform across the entire image?
*   [ ] Is the image sharp, clear, and high-resolution?

**FINAL OUTPUT REQUIREMENT:** Only when all checks are passed, output the single, perfected image. Do not provide text, explanations, or apologies. The result must be indistinguishable from a professional, high-resolution flatbed scan.` },
  { id: 'upscale', label: 'Upscale', emoji: '📈', title: 'Increase image resolution with AI', prompt: "Upscale this image to a higher resolution. Intelligently enhance details, sharpen edges, and remove compression artifacts to create a crisp, clear, high-quality version. Do not change the content or composition of the image." },
  { id: 'magicErase', label: 'Magic Erase', emoji: '🪄', title: 'Select and remove unwanted objects from a photo', prompt: '' },
  { id: 'magicReplace', label: 'Magic Replace', emoji: '🔁', title: 'Select and replace an object in a photo using a prompt', prompt: '' },
  { id: 'aiBackground', label: 'AI BG', emoji: '🏞️', title: 'Replace the background of a photo using AI', prompt: '' },
  { id: 'crop', label: 'Crop', emoji: '📏', title: 'Crop, rotate, and straighten an image', prompt: '' },
  { id: 'filters', label: 'Filters', emoji: '🖌️', title: 'Apply stylish artistic filters to your photo', prompt: '' },
  { id: 'replaceSky', label: 'Replace Sky', emoji: '☁️', title: 'Replace the sky with a beautiful new one', prompt: 'Realistically replace the sky in this image with a beautiful, dramatic, and partly cloudy blue sky. Ensure the lighting on the rest of the image is adjusted to match the new sky for a seamless and natural look.' },
  { id: 'colorSplash', label: 'Color Pop', emoji: '🎯', title: 'Make the main subject color, background B&W', prompt: 'Identify the main subject in the photo. Keep the main subject in full, vibrant color while converting the entire background to a dramatic black and white. Ensure a clean edge between the color and monochrome areas.' },
  { id: 'straighten', label: 'Straighten', emoji: '📐', title: 'Automatically straighten a crooked photo', prompt: 'Analyze this image for a tilted horizon or perspective distortion and automatically straighten it. Crop the image slightly to remove any empty space created by the rotation, maintaining the original aspect ratio and composition as much as possible.' },
  { id: 'colorize', label: 'Colorize', emoji: '🎨', title: 'Colorize a single black and white photo', prompt: "Colorize this black and white photo, making the colors realistic and vibrant." },
  { id: 'portrait', label: 'Portrait', emoji: '👤', title: 'Apply portrait mode (background blur)', prompt: "Apply a portrait mode effect to this image. Keep the main subject in sharp focus and apply a beautiful, creamy bokeh/blur to the background." },
  { id: 'vintage', label: 'Vintage', emoji: '🎞️', title: 'Give the photo a vintage film look', prompt: "Give this photo a vintage look, like an old film photograph from the 1970s. Adjust colors to be warm and faded, add subtle film grain, and a slight vignette effect." },
  { id: 'cartoon', label: 'Cartoonify', emoji: '💥', title: 'Turn the photo into a cartoon', prompt: "Convert this photo into a cartoon. Use bold outlines and vibrant colors to give it a comic-book feel." },
  { id: 'stickerify', label: 'Sticker-fy', emoji: '🏷️', title: 'Isolate the subject and turn it into a sticker with a transparent background', prompt: "First, perfectly isolate the main subject of this image from its background. Then, create a clean, bold white outline around the subject. The outline should be approximately 5% of the subject's width. Finally, add a subtle drop shadow behind the subject and its outline to make it pop. The final output MUST have a transparent background and be in PNG format." },
  { id: 'styleRemix', label: 'Style Remix', emoji: '🎭', title: 'Apply the artistic style of another image to your photo', prompt: '' },
  { id: 'sunlight', label: 'Add Light', emoji: '☀️', title: 'Add dramatic sunlight to the image', prompt: "Add warm, golden hour sunlight streaming into the image from the top left. Create realistic light rays and lens flare effects that interact with the subjects in the photo." },
  { id: 'sketch', label: 'Sketch', emoji: '✏️', title: 'Convert the photo into a pencil sketch', prompt: "Convert this photo into a detailed black and white pencil sketch. Emphasize lines, shading, and texture to resemble a hand-drawn artwork." },
  { id: 'hdr', label: 'HDR', emoji: '🌟', title: 'Apply a High Dynamic Range (HDR) effect', prompt: "Apply a photorealistic High Dynamic Range (HDR) effect to this image. Significantly expand the dynamic range by balancing deep, detailed shadows with bright, well-defined highlights. Enhance local contrast to make textures and details pop. The colors should be vibrant and saturated, but still look natural and not overly processed. The final image should be crisp, clear, and full of depth." },
  { id: 'bAndW', label: 'B & W', emoji: '🔳', title: 'Convert to dramatic black and white', prompt: "Convert this photo into a powerful, high-contrast black and white image. Create deep, rich blacks and brilliant, clean whites, losing some mid-tone detail for a dramatic, punchy, and graphic effect. Emphasize textures, shapes, and tonal gradations." },
  { id: 'sepia', label: 'Sepia', emoji: '📜', title: 'Apply a classic sepia tone', prompt: "Apply a classic sepia tone to this photo to give it an authentic, vintage feel of an early 20th-century photograph. The toning should be warm, with rich brown and yellow hues, while preserving a good range of contrast. Add a very subtle grain to enhance the nostalgic, antique look." },
  { id: 'pixelate', label: '16-Bit Art', emoji: '👾', title: 'Turn the photo into 16-bit pixel art', prompt: "Recreate this photo as 16-bit era pixel art. The final image should be blocky with clearly defined square pixels. Use a limited, vibrant color palette derived from the original. Simplify complex shapes and textures into pixel clusters. This should look like a scene from a classic SNES or Genesis game. Do not just apply a mosaic filter; redraw the image using pixel art techniques to capture its essence." },
  { id: 'goldenHour', label: 'Golden Hour', emoji: '🌇', title: 'Apply a warm, golden hour lighting effect', prompt: "Bathe this photo in the warm, soft, and diffused light of the golden hour. Enhance the warm tones like yellows, oranges, and reds. Cast long, soft shadows. The overall mood should be serene and beautiful, as if taken just after sunrise or before sunset." },
  { id: 'neon', label: 'Neon', emoji: '🌃', title: 'Give the image a futuristic neon/cyberpunk look', prompt: "Transform this photo with a vibrant neon noir or cyberpunk aesthetic. Add glowing neon highlights to edges and key features. Shift the color palette towards deep blues, purples, and hot pinks. Introduce a sense of futuristic grit and atmosphere, perhaps with subtle rain or haze effects." },
  { id: 'miniature', label: 'Miniature', emoji: '🤏', title: 'Apply a tilt-shift/miniature effect', prompt: "Apply a tilt-shift or miniature faking effect to this photo. Create a narrow band of sharp focus across the main subject, then apply a strong, gradual blur to the areas above and below the focal plane. Increase color saturation and contrast to enhance the illusion that the scene is a small-scale model." },
  { id: 'longExposure', label: 'Long Exposure', emoji: '🌊', title: 'Simulate a long exposure effect', prompt: "Simulate a long exposure effect on this photo. Smooth out moving elements like water or clouds into a silky, ethereal blur. Keep stationary objects like rocks or buildings sharp and in focus. The final image should have a sense of motion and tranquility." },
];

const MAX_CONCURRENT_REQUESTS = 3;

type ViewMode = 'toggle' | 'slider' | 'side-by-side';

const App: React.FC = () => {
  const [originalImages, setOriginalImages] = useState<ImageFile[]>([]);
  const [prompt, setPrompt] = useState<string>('');
  const [negativePrompt, setNegativePrompt] = useState<string>('');
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [resolution, setResolution] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<AppError | null>(null);
  const [apiResponseText, setApiResponseText] = useState<string | null>(null);
  const [resetKey, setResetKey] = useState(0);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  
  // Edit mode state
  const [editMode, setEditMode] = useState<'single' | 'batch'>('single');

  // Batch processing state
  const [batchResults, setBatchResults] = useState<Record<number, BatchResult>>({});
  const [isBatchProcessing, setIsBatchProcessing] = useState(false);

  // History state for undo/redo (single mode)
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  
  // State for the unified result viewer
  const [viewMode, setViewMode] = useState<ViewMode>('toggle');
  const [toggleViewState, setToggleViewState] = useState<'original' | 'edited'>('edited');
  const [currentResultIndex, setCurrentResultIndex] = useState(0);

  // State for modals
  const [eraseModalState, setEraseModalState] = useState<{ isOpen: boolean; image: ImageFile | null }>({ isOpen: false, image: null });
  const [magicReplaceModalState, setMagicReplaceModalState] = useState<{ isOpen: boolean; image: ImageFile | null }>({ isOpen: false, image: null });
  const [aiBackgroundModalState, setAIBackgroundModalState] = useState<{ isOpen: boolean; image: ImageFile | null }>({ isOpen: false, image: null });
  const [filtersModalState, setFiltersModalState] = useState<{ isOpen: boolean; image: ImageFile | null }>({ isOpen: false, image: null });
  const [cropModalState, setCropModalState] = useState<{ isOpen: boolean; image: ImageFile | null }>({ isOpen: false, image: null });
  const [styleRemixModalState, setStyleRemixModalState] = useState<{ isOpen: boolean; image: ImageFile | null }>({ isOpen: false, image: null });

  // State for Tutorial modal
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  
  // Memoized value to get the current item being displayed in the result viewer
  const currentItem = useMemo(() => {
    if (editMode === 'single') {
        const edited = historyIndex >= 0 ? history[historyIndex] : null;
        // In single mode, if there are multiple originals, let user pick which one to show against the edit.
        const original = originalImages.length > 0 ? originalImages[0].url : null;
        return { original, edited, total: 1, currentIndex: 0 };
    }
    // Batch mode
    // FIX: Cast `Object.values` as `BatchResult[]` because it can return `unknown[]` on a numeric record, causing property access errors.
    const doneResults = (Object.values(batchResults) as BatchResult[]).filter(r => r.status === 'done' && r.imageUrl);
    if (doneResults.length === 0) {
        return { original: null, edited: null, total: 0, currentIndex: 0 };
    }
    const safeIndex = Math.min(currentResultIndex, doneResults.length - 1);
    const currentResult = doneResults[safeIndex];
    return {
        original: currentResult.originalUrl,
        edited: currentResult.imageUrl ?? null,
        total: doneResults.length,
        currentIndex: safeIndex
    };
  }, [editMode, history, historyIndex, originalImages, batchResults, currentResultIndex]);

  const handleImageUpload = useCallback((files: ImageFile[]) => {
    setOriginalImages(files);
    setError(null);
    setApiResponseText(null);
    setHistory([]);
    setHistoryIndex(-1);
    setBatchResults({});
    setIsBatchProcessing(false);
    setCurrentResultIndex(0);
    setViewMode('toggle');
    setToggleViewState('edited');
    if (files.length > 1 && editMode === 'single') {
        setEditMode('batch');
    } else if (files.length <= 1 && editMode === 'batch') {
        setEditMode('single');
    }
  }, [editMode]);

  const handleAddImages = useCallback((newImages: ImageFile[]) => {
    const updatedImages = [...originalImages, ...newImages];
    handleImageUpload(updatedImages);
  }, [originalImages, handleImageUpload]);

  const handleRemoveImage = useCallback((indexToRemove: number) => {
    const updatedImages = originalImages.filter((_, index) => index !== indexToRemove);
    handleImageUpload(updatedImages);
  }, [originalImages, handleImageUpload]);

  const getFinalPrompt = useCallback((customPrompt?: string) => {
    const resolutionInstructions = {
        Low: "Please generate the final image in low resolution (e.g. for a thumbnail or preview).",
        Medium: "Please generate the final image in a standard, medium resolution, balancing quality and file size.",
        High: "Please generate the final image in high resolution, aiming for maximum detail and quality.",
    };
    let finalPrompt = `${customPrompt || prompt}. ${resolutionInstructions[resolution]}`;
    if (negativePrompt.trim()) {
        finalPrompt += ` Negative Prompt: Do not include the following elements or concepts: ${negativePrompt}.`;
    }
    return finalPrompt;
  }, [prompt, negativePrompt, resolution]);
  
  const handleEdit = useCallback(async (customPrompt?: string, imagesToEdit = originalImages) => {
    if (imagesToEdit.length === 0) {
      setError({ code: 'VALIDATION_ERROR', message: 'Please upload at least one image to edit.' });
      return;
    }
     if (imagesToEdit.length > 1 && !(customPrompt || prompt)) {
      setError({ code: 'VALIDATION_ERROR', message: 'Please describe how you want to combine the images.' });
      return;
    }
    if (!customPrompt && !prompt) {
      setError({ code: 'VALIDATION_ERROR', message: 'Please provide an editing prompt.' });
      return;
    }

    setIsLoading(true);
    setError(null);
    setApiResponseText(null);
    setViewMode('toggle');
    setToggleViewState('edited');

    try {
      const imageInputs = imagesToEdit.map(img => ({
        base64ImageData: img.base64,
        mimeType: img.mimeType,
      }));
      
      const result = await editImageWithNanoBanana(imageInputs, getFinalPrompt(customPrompt));
        
      if (result.editedImage) {
        const newImage = `data:image/png;base64,${result.editedImage}`;
        const newHistory = history.slice(0, historyIndex + 1);
        setHistory([...newHistory, newImage]);
        setHistoryIndex(newHistory.length);
      } else {
        setError({ code: 'GENERIC_ERROR', message: 'The AI did not return an edited image. Please try a different prompt.' });
      }
      setApiResponseText(result.text);

    } catch (err) {
      console.error(err);
      if (err instanceof Error) {
        const [code, message] = err.message.split('::');
        if (message && Object.keys(errorDetailsMap).includes(code)) {
          setError({ code: code as AppError['code'], message });
        } else {
          setError({ code: 'GENERIC_ERROR', message: err.message });
        }
      } else {
        setError({ code: 'GENERIC_ERROR', message: 'An unknown error occurred.' });
      }
    } finally {
      setIsLoading(false);
    }
  }, [originalImages, prompt, history, historyIndex, getFinalPrompt]);

  const handleBatchEdit = useCallback(async (customPrompt?: string) => {
    if (originalImages.length === 0) {
        setError({ code: 'VALIDATION_ERROR', message: 'Please upload at least one image to edit.' });
        return;
    }
    if (!customPrompt && !prompt) {
        setError({ code: 'VALIDATION_ERROR', message: 'Please provide an editing prompt.' });
        return;
    }

    setError(null);
    setIsBatchProcessing(true);
    setCurrentResultIndex(0);
    setViewMode('toggle');
    setToggleViewState('edited');
    const finalPrompt = getFinalPrompt(customPrompt);

    const initialResults: Record<number, BatchResult> = {};
    originalImages.forEach((img, index) => {
        initialResults[index] = { status: 'queued', originalUrl: img.url };
    });
    setBatchResults(initialResults);

    const queue = [...originalImages.keys()];
    let processingCount = 0;

    const processQueue = async () => {
        while (queue.length > 0 && processingCount < MAX_CONCURRENT_REQUESTS) {
            processingCount++;
            const imageIndex = queue.shift()!;
            
            setBatchResults(prev => ({
                ...prev,
                [imageIndex]: { ...prev[imageIndex], status: 'processing' },
            }));

            try {
                const imageToProcess = originalImages[imageIndex];
                const imageInput = [{ base64ImageData: imageToProcess.base64, mimeType: imageToProcess.mimeType }];
                const result = await editImageWithNanoBanana(imageInput, finalPrompt);
                
                if (result.editedImage) {
                    setBatchResults(prev => ({
                        ...prev,
                        [imageIndex]: { ...prev[imageIndex], status: 'done', imageUrl: `data:image/png;base64,${result.editedImage}` },
                    }));
                } else {
                    throw new Error('AI did not return an image.');
                }
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Unknown error';
                setBatchResults(prev => ({
                    ...prev,
                    [imageIndex]: { ...prev[imageIndex], status: 'error', error: errorMessage },
                }));
            } finally {
                processingCount--;
                processQueue();
            }
        }

        if (queue.length === 0 && processingCount === 0) {
            setIsBatchProcessing(false);
        }
    };
    processQueue();
  }, [originalImages, prompt, getFinalPrompt]);


  const handlePrimaryAction = useCallback(() => {
    if (editMode === 'single') {
        handleEdit();
    } else {
        handleBatchEdit();
    }
  }, [editMode, handleEdit, handleBatchEdit]);

  const handleQuickAction = useCallback(async (actionId: string) => {
    const allActions = [...featuredActions, ...quickActions];
    const selectedAction = allActions.find(a => a.id === actionId);
    if (!selectedAction) {
        setError({ code: 'GENERIC_ERROR', message: 'An invalid quick action was selected.' });
        return;
    }

    const requiredImages = (editMode === 'batch' || selectedAction.prompt.includes("combine")) ? 0 : 1;

    if (requiredImages === 1 && originalImages.length !== 1) {
        setError({ code: 'VALIDATION_ERROR', message: `Please upload exactly one image to use the '${selectedAction.label}' feature.` });
        return;
    }

    // Modal triggers (only work in single mode)
    if (editMode === 'single') {
        if (actionId === 'magicErase') {
            setEraseModalState({ isOpen: true, image: originalImages[0] });
            return;
        }
        if (actionId === 'magicReplace') {
            setMagicReplaceModalState({ isOpen: true, image: originalImages[0] });
            return;
        }
        if (actionId === 'aiBackground') {
            setAIBackgroundModalState({ isOpen: true, image: originalImages[0] });
            return;
        }
        if (actionId === 'filters') {
            setFiltersModalState({ isOpen: true, image: originalImages[0] });
            return;
        }
        if (actionId === 'crop') {
            setCropModalState({ isOpen: true, image: originalImages[0] });
            return;
        }
        if (actionId === 'styleRemix') {
            setStyleRemixModalState({ isOpen: true, image: originalImages[0] });
            return;
        }
    }
    
    if (editMode === 'single') {
        handleEdit(selectedAction.prompt);
    } else {
        handleBatchEdit(selectedAction.prompt);
    }

  }, [originalImages, handleEdit, handleBatchEdit, editMode]);
  
  const handleApplyErase = useCallback(async (maskBase64: string) => {
    const { image } = eraseModalState;
    if (!image) return;

    setEraseModalState({ isOpen: false, image: null });
    setIsLoading(true);
    setError(null);
    setApiResponseText(null);

    try {
        const originalImageInput = {
            base64ImageData: image.base64,
            mimeType: image.mimeType,
        };
        const maskInput = {
            base64ImageData: maskBase64,
            mimeType: 'image/png',
        };

        const finalPrompt = `You are a professional photo editor. Your task is to perform a content-aware fill (inpainting). I have provided an original image and a corresponding mask. The area to be removed and filled is marked in white on the mask image. Analyze the surrounding pixels and seamlessly fill the masked area with realistic, context-appropriate content. Do not alter the rest of the image. Output only the final, fully edited image.`;

        const result = await editImageWithNanoBanana([originalImageInput], finalPrompt, maskInput);
        
        if (result.editedImage) {
            const newImage = `data:image/png;base64,${result.editedImage}`;
            const newHistory = history.slice(0, historyIndex + 1);
            setHistory([...newHistory, newImage]);
            setHistoryIndex(newHistory.length);
            setApiResponseText(result.text || "The selected object has been magically erased.");
            setViewMode('toggle');
            setToggleViewState('edited');
        } else {
            setError({ code: 'GENERIC_ERROR', message: "The AI could not perform the erase action. Please try again." });
        }
    } catch (err) {
        console.error(err);
        if (err instanceof Error) {
            const [code, message] = err.message.split('::');
            if (message && Object.keys(errorDetailsMap).includes(code)) {
                setError({ code: code as AppError['code'], message });
            } else {
                setError({ code: 'GENERIC_ERROR', message: `An unknown error occurred during the Magic Erase action.` });
            }
        } else {
            setError({ code: 'GENERIC_ERROR', message: 'An unknown error occurred.' });
        }
    } finally {
        setIsLoading(false);
    }
  }, [eraseModalState, history, historyIndex]);

  const handleApplyMagicReplace = useCallback(async (maskBase64: string, replacementPrompt: string) => {
    const { image } = magicReplaceModalState;
    if (!image) return;

    setMagicReplaceModalState({ isOpen: false, image: null });
    setIsLoading(true);
    setError(null);
    setApiResponseText(null);

    try {
        const originalImageInput = { base64ImageData: image.base64, mimeType: image.mimeType };
        const maskInput = { base64ImageData: maskBase64, mimeType: 'image/png' };
        
        const finalPrompt = `You are a professional photo editor. Your task is to perform a content-aware replacement. I have provided an original image and a corresponding mask. The area to be replaced is marked in white on the mask image. Analyze the surrounding pixels, lighting, and context, and seamlessly replace the masked area with the following content: "${replacementPrompt}". Do not alter the rest of the image. Output only the final, fully edited image.`;

        const result = await editImageWithNanoBanana([originalImageInput], finalPrompt, maskInput);
        
        if (result.editedImage) {
            const newImage = `data:image/png;base64,${result.editedImage}`;
            const newHistory = history.slice(0, historyIndex + 1);
            setHistory([...newHistory, newImage]);
            setHistoryIndex(newHistory.length);
            setApiResponseText(result.text || "The selected object has been magically replaced.");
            setViewMode('toggle');
            setToggleViewState('edited');
        } else {
            setError({ code: 'GENERIC_ERROR', message: "The AI could not perform the replace action. Please try again." });
        }
    } catch (err) {
        console.error("Magic Replace Error:", err);
        setError({ code: 'GENERIC_ERROR', message: 'An error occurred during the Magic Replace action.' });
    } finally {
        setIsLoading(false);
    }
  }, [magicReplaceModalState, history, historyIndex]);

  const handleApplyAIBackground = useCallback(async (backgroundPrompt: string) => {
    setAIBackgroundModalState({ isOpen: false, image: null });
    handleEdit(`First, perfectly isolate the main subject from its background in the provided image. Then, create a new, photorealistic background based on this description: "${backgroundPrompt}". Place the isolated subject into the new background. Crucially, you must adjust the lighting, shadows, colors, and perspective of the subject to make it look like it was originally photographed in the new environment. The integration must be seamless and believable. Output only the final composited image.`);
  }, [handleEdit]);

  const handleApplyFilter = useCallback(async (filterPrompt: string) => {
    setFiltersModalState({ isOpen: false, image: null });
    handleEdit(filterPrompt);
  }, [handleEdit]);

  const handleApplyCrop = useCallback((croppedImageBase64: string) => {
    setCropModalState({ isOpen: false, image: null });
    
    if (!croppedImageBase64) {
        setError({ code: 'GENERIC_ERROR', message: 'Cropping failed to produce an image.' });
        return;
    }

    const newImage = `data:image/png;base64,${croppedImageBase64}`;
    const newHistory = history.slice(0, historyIndex + 1);
    setHistory([...newHistory, newImage]);
    setHistoryIndex(newHistory.length);
    setApiResponseText("Image cropped successfully.");
    setError(null);
    setViewMode('toggle');
    setToggleViewState('edited');
  }, [history, historyIndex]);

  const handleApplyStyleRemix = useCallback(async (styleImage: ImageFile) => {
    const { image: contentImage } = styleRemixModalState;
    if (!contentImage || !styleImage) return;

    setStyleRemixModalState({ isOpen: false, image: null });
    setIsLoading(true);
    setError(null);
    setApiResponseText(null);
    setViewMode('toggle');
    setToggleViewState('edited');
    
    try {
        const styleRemixPrompt = `You are a master artist specializing in style transfer. You will be given multiple images. The first image is the 'content' image. The second image is the 'style' image. Your task is to completely redraw the 'content' image in the artistic style of the 'style' image. Analyze the style image's color palette, textures, brush strokes, and overall mood, and apply it to the content image. The final output should retain the recognizable composition of the content image but look as if it were created by the artist of the style image.`;

        const imageInputs = [
            { base64ImageData: contentImage.base64, mimeType: contentImage.mimeType },
            { base64ImageData: styleImage.base64, mimeType: styleImage.mimeType },
        ];
        
        const result = await editImageWithNanoBanana(imageInputs, styleRemixPrompt);
        
        if (result.editedImage) {
            const newImage = `data:image/png;base64,${result.editedImage}`;
            const newHistory = history.slice(0, historyIndex + 1);
            setHistory([...newHistory, newImage]);
            setHistoryIndex(newHistory.length);
            setApiResponseText(result.text || "Style successfully remixed!");
        } else {
            setError({ code: 'GENERIC_ERROR', message: 'The AI did not return an image for the style remix. Please try a different style image.' });
        }
    } catch (err) {
      console.error("Style Remix Error:", err);
      if (err instanceof Error) {
        const [code, message] = err.message.split('::');
        if (message && Object.keys(errorDetailsMap).includes(code)) {
          setError({ code: code as AppError['code'], message });
        } else {
          setError({ code: 'GENERIC_ERROR', message: err.message });
        }
      } else {
        setError({ code: 'GENERIC_ERROR', message: 'An unknown error occurred during Style Remix.' });
      }
    } finally {
        setIsLoading(false);
    }
  }, [styleRemixModalState, history, historyIndex]);

  const handleExamplePrompt = useCallback(() => {
    const randomPrompt = examplePrompts[Math.floor(Math.random() * examplePrompts.length)];
    setPrompt(randomPrompt);
  }, []);

  const handleReset = useCallback(() => {
    setOriginalImages([]);
    setPrompt('');
    setNegativePrompt('');
    setShowAdvanced(false);
    setError(null);
    setApiResponseText(null);
    setHistory([]);
    setHistoryIndex(-1);
    setResetKey(prevKey => prevKey + 1);
    setBatchResults({});
    setIsBatchProcessing(false);
    setViewMode('toggle');
    setToggleViewState('edited');
    setCurrentResultIndex(0);
  }, []);
  
  const handleDownload = useCallback(() => {
    if (!currentItem.edited) return;
    
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const filename = `glowmint_${year}${month}${day}_${hours}${minutes}${seconds}.png`;

    const link = document.createElement('a');
    link.href = currentItem.edited;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [currentItem.edited]);

  const handleUseAsInput = useCallback(() => {
    if (!currentItem.edited) return;
    const newImageFile: ImageFile = {
      url: currentItem.edited,
      base64: currentItem.edited.split(',')[1],
      mimeType: 'image/png',
    };
    handleImageUpload([newImageFile]);
  }, [currentItem.edited, handleImageUpload]);

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(prev => prev - 1);
    } else if (historyIndex === 0) {
      setHistoryIndex(-1); // Go back to "no image" state
    }
  }, [historyIndex]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(prev => prev + 1);
    }
  }, [historyIndex, history.length]);

  const handleViewFullscreen = useCallback((url: string) => {
    setFullscreenImage(url);
  }, []);

  const handleCloseFullscreen = useCallback(() => {
    setFullscreenImage(null);
  }, []);

  const handlePrevResult = useCallback(() => {
    setCurrentResultIndex(prev => (prev > 0 ? prev - 1 : currentItem.total - 1));
  }, [currentItem.total]);

  const handleNextResult = useCallback(() => {
    setCurrentResultIndex(prev => (prev < currentItem.total - 1 ? prev + 1 : 0));
  }, [currentItem.total]);
  
  const handleOpenTutorial = useCallback(() => {
    setIsTutorialOpen(true);
  }, []);

  const handleCloseTutorial = useCallback(() => {
    setIsTutorialOpen(false);
  }, []);
  
  const batchProgress = useMemo(() => {
    const total = Object.keys(batchResults).length;
    if (total === 0) return 0;
    const done = (Object.values(batchResults) as BatchResult[]).filter((r) => r.status === 'done' || r.status === 'error').length;
    return (done / total) * 100;
  }, [batchResults]);

  const canReset = originalImages.length > 0 || prompt || negativePrompt || history.length > 0;
  const canDoQuickAction = (editMode === 'single' && originalImages.length === 1 && !isLoading) || (editMode === 'batch' && originalImages.length > 0 && !isBatchProcessing);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans flex flex-col">
      {(isLoading || isBatchProcessing) && <LoadingOverlay />}
      {fullscreenImage && <FullscreenModal imageUrl={fullscreenImage} onClose={handleCloseFullscreen} />}
      {eraseModalState.isOpen && eraseModalState.image && (
          <MagicEraseModal 
              image={eraseModalState.image}
              onClose={() => setEraseModalState({isOpen: false, image: null})}
              onApply={handleApplyErase}
          />
      )}
      {magicReplaceModalState.isOpen && magicReplaceModalState.image && (
          <MagicReplaceModal 
              image={magicReplaceModalState.image}
              onClose={() => setMagicReplaceModalState({isOpen: false, image: null})}
              onApply={handleApplyMagicReplace}
          />
      )}
      {aiBackgroundModalState.isOpen && aiBackgroundModalState.image && (
          <AIBackgroundModal 
              image={aiBackgroundModalState.image}
              onClose={() => setAIBackgroundModalState({isOpen: false, image: null})}
              onApply={handleApplyAIBackground}
          />
      )}
      {filtersModalState.isOpen && filtersModalState.image && (
          <FiltersModal
              image={filtersModalState.image}
              onClose={() => setFiltersModalState({isOpen: false, image: null})}
              onApply={handleApplyFilter}
          />
      )}
      {cropModalState.isOpen && cropModalState.image && (
          <CropModal
              image={cropModalState.image}
              onClose={() => setCropModalState({isOpen: false, image: null})}
              onApply={handleApplyCrop}
              onApplyAI={handleEdit}
          />
      )}
      {styleRemixModalState.isOpen && styleRemixModalState.image && (
          <StyleRemixModal
              image={styleRemixModalState.image}
              onClose={() => setStyleRemixModalState({ isOpen: false, image: null })}
              onApply={handleApplyStyleRemix}
          />
      )}
      {isTutorialOpen && <TutorialModal onClose={handleCloseTutorial} />}
      <Header />
      <main className="container mx-auto p-4 md:p-8 flex-grow">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          
          {/* Controls Column */}
          <div className="lg:col-span-2 flex flex-col space-y-6">
            <section className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-6 rounded-2xl shadow-lg animate-fade-in">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-3">
                <span className="bg-teal-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-md">1</span>
                Upload Photos
              </h2>
              <ImageUploader
                key={resetKey}
                images={originalImages}
                onAddImages={handleAddImages}
                onRemoveImage={handleRemoveImage}
              />
            </section>
            
            <section className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-6 rounded-2xl shadow-lg animate-fade-in" style={{animationDelay: '100ms'}}>
              <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold flex items-center gap-3">
                    <span className="bg-teal-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-md">2</span>
                    Choose Your Edit
                  </h2>
                  <div className="bg-slate-700 p-1 rounded-full flex items-center text-sm font-semibold">
                      <button onClick={() => setEditMode('single')} className={`px-3 py-1 rounded-full transition-colors ${editMode === 'single' ? 'bg-teal-600 text-white' : 'text-slate-300 hover:bg-slate-600'}`}>Single</button>
                      <button onClick={() => setEditMode('batch')} disabled={originalImages.length <= 1} className={`px-3 py-1 rounded-full transition-colors ${editMode === 'batch' ? 'bg-teal-600 text-white' : 'text-slate-300 hover:bg-slate-600'} disabled:text-slate-500 disabled:hover:bg-transparent disabled:cursor-not-allowed`}>Batch</button>
                  </div>
              </div>

               <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold text-slate-300">Edit with a Prompt</h3>
                    {editMode === 'single' && (
                    <button
                      onClick={handleExamplePrompt}
                      className="text-sm font-semibold text-teal-400 hover:text-teal-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50 rounded px-2 py-1 transform hover:-translate-y-0.5"
                      aria-label="Generate an example prompt"
                      title="Get a random suggestion for an edit prompt"
                    >
                      Try an example ✨
                    </button>
                    )}
                  </div>
                  <PromptInput
                    prompt={prompt}
                    setPrompt={setPrompt}
                    isDisabled={originalImages.length === 0 || isLoading || isBatchProcessing}
                    rows={3}
                  />
                </div>

                <ResolutionSelector
                  selectedResolution={resolution}
                  onResolutionChange={setResolution}
                  isDisabled={originalImages.length === 0 || isLoading || isBatchProcessing}
                />
                
                <div className="mt-6">
                  <button
                    onClick={() => setShowAdvanced(prev => !prev)}
                    className="w-full flex justify-between items-center text-left p-2 -mx-2 rounded-md hover:bg-slate-700/50 transition-colors duration-200"
                    aria-expanded={showAdvanced}
                    aria-controls="advanced-options-panel"
                  >
                    <span className="font-semibold text-slate-300">Advanced Options</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 text-slate-400 transition-transform duration-300 ${showAdvanced ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {showAdvanced && (
                    <div id="advanced-options-panel" className="mt-4 animate-fade-in">
                      <label htmlFor="negative-prompt-input" className="block text-sm font-medium text-slate-300 mb-2">
                        Negative Prompt
                      </label>
                      <PromptInput
                        id="negative-prompt-input"
                        prompt={negativePrompt}
                        setPrompt={setNegativePrompt}
                        isDisabled={originalImages.length === 0 || isLoading || isBatchProcessing}
                        rows={2}
                        placeholder="e.g., text, watermarks, blurry, extra limbs"
                      />
                      <p className="text-xs text-slate-500 mt-2">Describe what you don't want to see in the edited image.</p>
                    </div>
                  )}
                </div>

                 <div className="h-px bg-slate-700 my-6"></div>
                 <div>
                  <h3 className="font-semibold text-slate-300 mb-3">Quick Actions</h3>
                  <div className="grid grid-cols-4 gap-2">
                    {featuredActions.map(action => (
                      <button
                        key={action.id}
                        onClick={() => handleQuickAction(action.id)}
                        disabled={!canDoQuickAction}
                        className="p-2 bg-teal-700/50 border border-teal-600 text-white font-semibold text-xs rounded-lg shadow-lg hover:bg-teal-600/60 disabled:bg-slate-700/50 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 flex flex-col items-center justify-center gap-1 text-center h-16 transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-75"
                        title={action.title}
                      >
                        <span className="text-xl" aria-hidden="true">{action.emoji}</span>
                        <span className="leading-tight">{action.label}</span>
                      </button>
                    ))}
                  </div>

                  <div className="my-4 flex items-center gap-2">
                    <div className="h-px bg-slate-700 flex-grow"></div>
                    <span className="text-xs text-slate-500">More Effects</span>
                    <div className="h-px bg-slate-700 flex-grow"></div>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    {quickActions.map(action => (
                      <button
                        key={action.id}
                        onClick={() => handleQuickAction(action.id)}
                        disabled={!canDoQuickAction || (editMode === 'batch' && ['magicErase', 'magicReplace', 'aiBackground', 'filters', 'crop', 'styleRemix'].includes(action.id))}
                        className="p-2 bg-slate-700 text-white font-semibold text-xs rounded-lg shadow-lg hover:bg-slate-600 disabled:bg-slate-700/50 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 flex flex-col items-center justify-center gap-1 text-center h-16 transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-75"
                        title={action.title + ((editMode === 'batch' && ['magicErase', 'magicReplace', 'aiBackground', 'filters', 'crop', 'styleRemix'].includes(action.id)) ? ' (Single Edit Mode Only)' : '')}
                      >
                        <span className="text-xl" aria-hidden="true">{action.emoji}</span>
                        <span className="leading-tight">{action.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
            </section>

            <section className="flex flex-col space-y-3 animate-fade-in" style={{animationDelay: '200ms'}}>
              <button
                onClick={handlePrimaryAction}
                disabled={originalImages.length === 0 || (!prompt && editMode === 'single') || isLoading || isBatchProcessing}
                className="py-4 px-6 bg-teal-600 text-white font-bold text-lg rounded-xl shadow-lg hover:bg-teal-500 disabled:bg-teal-600/50 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-teal-500 focus:ring-opacity-50"
                title="Send your images and prompt to the AI for editing"
              >
                {isLoading || isBatchProcessing ? 'Generating...' : `✨ Generate ${editMode === 'batch' ? `Batch (${originalImages.length})` : 'Edit'}`}
              </button>

              <button
                onClick={handleReset}
                disabled={!canReset || isLoading || isBatchProcessing}
                className="py-3 px-6 bg-transparent border border-slate-600 hover:bg-slate-700 text-slate-300 font-bold rounded-xl disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-all duration-200 transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-slate-500"
                aria-label="Reset all fields and images"
                title="Clear the uploaded images, prompt, and result"
              >
                Reset
              </button>
            </section>

            {error && <ErrorDisplay error={error} />}
          </div>
          
          {/* Display Column */}
          <div className="lg:col-span-3 bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-6 rounded-2xl shadow-lg min-h-[500px] lg:min-h-0 flex flex-col animate-fade-in" style={{animationDelay: '300ms'}}>
             <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-slate-300">Result</h2>
                {editMode === 'single' ? (
                <div className="flex items-center space-x-2">
                    <button
                    onClick={handleUndo}
                    disabled={historyIndex < 0 || isLoading}
                    className="p-2 bg-slate-700 rounded-md hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-slate-500"
                    aria-label="Undo last edit"
                    title="Undo last edit"
                    >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 15l-3-3m0 0l3-3m-3 3h8a5 5 0 015 5v1" />
                    </svg>
                    </button>
                    <button
                    onClick={handleRedo}
                    disabled={historyIndex >= history.length - 1 || isLoading}
                    className="p-2 bg-slate-700 rounded-md hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-slate-500"
                    aria-label="Redo last edit"
                    title="Redo last edit"
                    >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 15l3-3m0 0l-3-3m3 3H8a5 5 0 00-5 5v1" />
                    </svg>
                    </button>
                </div>
                ) : isBatchProcessing ? (
                  <div className="w-48 flex items-center gap-2">
                    <span className="text-sm text-slate-400 font-semibold">Processing...</span>
                    <div className="w-full bg-slate-700 rounded-full h-2.5">
                        <div className="bg-teal-500 h-2.5 rounded-full" style={{ width: `${batchProgress}%`, transition: 'width 0.5s ease-in-out' }}></div>
                    </div>
                  </div>
                ) : currentItem.total > 0 ? (
                    <div className="text-sm font-semibold text-slate-400">Result {currentItem.currentIndex + 1} of {currentItem.total}</div>
                ) : null}
            </div>
            
            <div className="flex-grow flex flex-col">
              {/* Main Display Area */}
              <div className="flex-grow w-full aspect-square bg-slate-900/50 rounded-xl border-2 border-slate-700 flex items-center justify-center overflow-hidden relative">
                {!currentItem.edited && originalImages.length === 0 ? (
                    <div className="flex-grow flex flex-col items-center justify-center text-center text-slate-500 p-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        <p className="mt-4 text-lg font-semibold text-slate-400">Let's create something amazing</p>
                        <p className="mt-1 text-sm">Upload one or more photos to start editing with AI.</p>
                    </div>
                ) : !currentItem.edited && originalImages.length > 0 ? (
                    <ImageDisplay imageUrl={originalImages[0].url} isLoading={isLoading} onViewFullscreen={handleViewFullscreen} />
                ) : viewMode === 'slider' && currentItem.original && currentItem.edited ? (
                  <ImageCompareSlider 
                    beforeImageUrl={currentItem.original} 
                    afterImageUrl={currentItem.edited}
                  />
                ) : viewMode === 'side-by-side' && currentItem.original && currentItem.edited ? (
                    <div className="grid grid-cols-2 gap-2 w-full h-full p-2">
                        <div className="relative bg-black rounded-lg overflow-hidden"><img src={currentItem.original} className="w-full h-full object-contain"/><span className="absolute top-1 left-1 text-xs bg-slate-800/80 text-white px-2 py-0.5 rounded-full">Original</span></div>
                        <div className="relative bg-black rounded-lg overflow-hidden"><img src={currentItem.edited} className="w-full h-full object-contain"/><span className="absolute top-1 left-1 text-xs bg-teal-800/80 text-white px-2 py-0.5 rounded-full">Edited</span></div>
                    </div>
                ) : (
                    <ImageDisplay
                        imageUrl={toggleViewState === 'original' ? currentItem.original : currentItem.edited}
                        isLoading={isLoading}
                        onViewFullscreen={handleViewFullscreen}
                    />
                )}
                 {editMode === 'batch' && currentItem.total > 1 && !isBatchProcessing && (
                    <div className="absolute inset-y-0 inset-x-0 flex items-center justify-between p-4 pointer-events-none">
                        <button
                            onClick={handlePrevResult}
                            className="p-3 bg-slate-900/60 backdrop-blur-sm rounded-full text-white hover:bg-slate-800/80 transition-all shadow-lg pointer-events-auto transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-teal-500"
                            aria-label="Previous result"
                            title="Previous result"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                        </button>
                        <button
                            onClick={handleNextResult}
                            className="p-3 bg-slate-900/60 backdrop-blur-sm rounded-full text-white hover:bg-slate-800/80 transition-all shadow-lg pointer-events-auto transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-teal-500"
                            aria-label="Next result"
                            title="Next result"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                        </button>
                    </div>
                 )}
              </div>

              {/* Control Bar Area */}
              <div className="flex-shrink-0 mt-4 space-y-4">
                {currentItem.edited && !isLoading && (
                  <div className="flex items-center justify-center flex-wrap gap-4 animate-fade-in">
                    {viewMode === 'toggle' && (
                      <div className="bg-slate-700 p-1 rounded-full flex items-center text-sm font-semibold">
                        <button 
                          onClick={() => setToggleViewState('original')} 
                          className={`px-4 py-1.5 rounded-full transition-colors ${toggleViewState === 'original' ? 'bg-teal-600 text-white' : 'text-slate-300 hover:bg-slate-600'}`}
                        >
                          Original
                        </button>
                        <button 
                          onClick={() => setToggleViewState('edited')}
                          className={`px-4 py-1.5 rounded-full transition-colors ${toggleViewState === 'edited' ? 'bg-teal-600 text-white' : 'text-slate-300 hover:bg-slate-600'}`}
                        >
                          Edited
                        </button>
                      </div>
                    )}
                    
                    <div className="bg-slate-900 border border-slate-700 p-1 rounded-full flex items-center text-sm font-semibold">
                        <button onClick={() => setViewMode('toggle')} className={`px-3 py-1.5 rounded-full transition-colors ${viewMode === 'toggle' ? 'bg-slate-600' : 'text-slate-400 hover:text-white'}`}>Toggle</button>
                        <button onClick={() => setViewMode('slider')} className={`px-3 py-1.5 rounded-full transition-colors ${viewMode === 'slider' ? 'bg-slate-600' : 'text-slate-400 hover:text-white'}`}>Slider</button>
                        <button onClick={() => setViewMode('side-by-side')} className={`px-3 py-1.5 rounded-full transition-colors ${viewMode === 'side-by-side' ? 'bg-slate-600' : 'text-slate-400 hover:text-white'}`}>Side-by-Side</button>
                    </div>
                  </div>
                )}

                {currentItem.edited && !isLoading && (
                  <div className="w-full flex flex-col sm:flex-row items-center gap-3 animate-fade-in">
                     <button
                        onClick={handleDownload}
                        className="w-full py-3 px-4 bg-green-600 text-white font-bold rounded-lg shadow-md hover:bg-green-500 transition-all duration-200 flex items-center justify-center space-x-2 transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-green-400"
                        aria-label="Download edited image"
                        title="Save the edited image to your device"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                        <span>Download</span>
                    </button>
                     <button
                        onClick={handleUseAsInput}
                        className="w-full py-3 px-4 bg-teal-600 text-white font-bold rounded-lg shadow-md hover:bg-teal-500 transition-all duration-200 flex items-center justify-center space-x-2 transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-teal-400"
                        aria-label="Use edited image as new input"
                        title="Use this edited image as the new original for further edits"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 110 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                        </svg>
                        <span>Use as Input</span>
                    </button>
                  </div>
                )}
                
                {apiResponseText && !isLoading && editMode === 'single' && (
                  <div className="mt-2 p-4 bg-slate-900/70 rounded-lg border border-slate-700 animate-fade-in">
                    <p className="text-sm text-slate-400 font-semibold mb-2">AI Commentary:</p>
                    <p className="text-slate-300 italic">"{apiResponseText}"</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer onOpenTutorial={handleOpenTutorial} />
    </div>
  );
};

export default App;
