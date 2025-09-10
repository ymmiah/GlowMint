import React, { useState, useCallback } from 'react';
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

  // History state for undo/redo
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  
  // State for before/after comparison
  const [showCompare, setShowCompare] = useState<boolean>(false);
  
  // State for modals
  const [eraseModalState, setEraseModalState] = useState<{ isOpen: boolean; image: ImageFile | null }>({ isOpen: false, image: null });
  const [magicReplaceModalState, setMagicReplaceModalState] = useState<{ isOpen: boolean; image: ImageFile | null }>({ isOpen: false, image: null });
  const [aiBackgroundModalState, setAIBackgroundModalState] = useState<{ isOpen: boolean; image: ImageFile | null }>({ isOpen: false, image: null });
  const [filtersModalState, setFiltersModalState] = useState<{ isOpen: boolean; image: ImageFile | null }>({ isOpen: false, image: null });
  const [cropModalState, setCropModalState] = useState<{ isOpen: boolean; image: ImageFile | null }>({ isOpen: false, image: null });


  // State for Tutorial modal
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);

  const currentEditedImage = historyIndex >= 0 ? history[historyIndex] : null;

  const handleImageUpload = useCallback((files: ImageFile[]) => {
    setOriginalImages(files);
    setError(null);
    setApiResponseText(null);
    setHistory([]);
    setHistoryIndex(-1);
    setShowCompare(false);
  }, []);

  const handleAddImages = useCallback((newImages: ImageFile[]) => {
    const updatedImages = [...originalImages, ...newImages];
    handleImageUpload(updatedImages);
  }, [originalImages, handleImageUpload]);

  const handleRemoveImage = useCallback((indexToRemove: number) => {
    const updatedImages = originalImages.filter((_, index) => index !== indexToRemove);
    handleImageUpload(updatedImages);
  }, [originalImages, handleImageUpload]);
  
  const handleEdit = useCallback(async (customPrompt?: string) => {
    if (originalImages.length === 0) {
      setError({ code: 'VALIDATION_ERROR', message: 'Please upload at least one image to edit.' });
      return;
    }
     if (originalImages.length > 1 && !(customPrompt || prompt)) {
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
    setShowCompare(false);

    try {
      const imageInputs = originalImages.map(img => ({
        base64ImageData: img.base64,
        mimeType: img.mimeType,
      }));

      const resolutionInstructions = {
        Low: "Please generate the final image in low resolution (e.g. for a thumbnail or preview).",
        Medium: "Please generate the final image in a standard, medium resolution, balancing quality and file size.",
        High: "Please generate the final image in high resolution, aiming for maximum detail and quality.",
      };
      
      let finalPrompt = `${customPrompt || prompt}. ${resolutionInstructions[resolution]}`;
      if (negativePrompt.trim()) {
        finalPrompt += ` Negative Prompt: Do not include the following elements or concepts: ${negativePrompt}.`;
      }
      
      const result = await editImageWithNanoBanana(imageInputs, finalPrompt);
        
      if (result.editedImage) {
        const newImage = `data:image/png;base64,${result.editedImage}`;
        const newHistory = history.slice(0, historyIndex + 1); // Truncate history if we've undone
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
  }, [originalImages, prompt, negativePrompt, history, historyIndex, resolution]);

  const handleQuickAction = useCallback(async (actionId: string) => {
    const allActions = [...featuredActions, ...quickActions];
    const selectedAction = allActions.find(a => a.id === actionId);
    if (!selectedAction) {
        setError({ code: 'GENERIC_ERROR', message: 'An invalid quick action was selected.' });
        return;
    }

    if (originalImages.length !== 1) {
      setError({ code: 'VALIDATION_ERROR', message: `Please upload exactly one image to use the '${selectedAction.label}' feature.` });
      return;
    }

    // Modal triggers
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

    handleEdit(selectedAction.prompt);

  }, [originalImages, handleEdit]);
  
  const handleApplyErase = useCallback(async (maskBase64: string) => {
    const { image } = eraseModalState;
    if (!image) return;

    setEraseModalState({ isOpen: false, image: null });
    setIsLoading(true);
    setError(null);
    setApiResponseText(null);
    setShowCompare(false);

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
    setShowCompare(false);

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
    setShowCompare(false);
    setError(null);
  }, [history, historyIndex]);

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
    setShowCompare(false);
  }, []);
  
  const handleDownload = useCallback(() => {
    if (!currentEditedImage) return;
    
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const filename = `glowmint_${year}${month}${day}_${hours}${minutes}${seconds}.png`;

    const link = document.createElement('a');
    link.href = currentEditedImage;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [currentEditedImage]);

  const handleUseAsInput = useCallback(() => {
    if (!currentEditedImage) return;
    const newImageFile: ImageFile = {
      url: currentEditedImage,
      base64: currentEditedImage.split(',')[1],
      mimeType: 'image/png',
    };
    handleImageUpload([newImageFile]);
  }, [currentEditedImage, handleImageUpload]);

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

  const handleToggleCompare = useCallback(() => {
    setShowCompare(prev => !prev);
  }, []);
  
  const handleOpenTutorial = useCallback(() => {
    setIsTutorialOpen(true);
  }, []);

  const handleCloseTutorial = useCallback(() => {
    setIsTutorialOpen(false);
  }, []);

  const canReset = originalImages.length > 0 || prompt || negativePrompt || history.length > 0;
  const canCompare = currentEditedImage && originalImages.length === 1 && !isLoading;
  const canDoQuickAction = originalImages.length === 1 && !isLoading;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans flex flex-col">
      {isLoading && <LoadingOverlay />}
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
              <h2 className="text-xl font-bold mb-4 flex items-center gap-3">
                <span className="bg-teal-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-md">2</span>
                Choose Your Edit
              </h2>
               <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold text-slate-300">Edit with a Prompt</h3>
                    <button
                      onClick={handleExamplePrompt}
                      className="text-sm font-semibold text-teal-400 hover:text-teal-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50 rounded px-2 py-1 transform hover:-translate-y-0.5"
                      aria-label="Generate an example prompt"
                      title="Get a random suggestion for an edit prompt"
                    >
                      Try an example ✨
                    </button>
                  </div>
                  <PromptInput
                    prompt={prompt}
                    setPrompt={setPrompt}
                    isDisabled={originalImages.length === 0 || isLoading}
                    rows={3}
                  />
                </div>

                <ResolutionSelector
                  selectedResolution={resolution}
                  onResolutionChange={setResolution}
                  isDisabled={originalImages.length === 0 || isLoading}
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
                        isDisabled={originalImages.length === 0 || isLoading}
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
                        disabled={!canDoQuickAction}
                        className="p-2 bg-slate-700 text-white font-semibold text-xs rounded-lg shadow-lg hover:bg-slate-600 disabled:bg-slate-700/50 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 flex flex-col items-center justify-center gap-1 text-center h-16 transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-75"
                        title={action.title}
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
                onClick={() => handleEdit()}
                disabled={originalImages.length === 0 || !prompt || isLoading}
                className="py-4 px-6 bg-teal-600 text-white font-bold text-lg rounded-xl shadow-lg hover:bg-teal-500 disabled:bg-teal-600/50 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-teal-500 focus:ring-opacity-50"
                title="Send your images and prompt to the AI for editing"
              >
                {isLoading ? 'Generating...' : '✨ Generate Edit'}
              </button>

              <button
                onClick={handleReset}
                disabled={!canReset || isLoading}
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
            </div>
            
            {originalImages.length === 0 ? (
                <div className="flex-grow flex flex-col items-center justify-center text-center text-slate-500 p-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="mt-4 text-lg font-semibold text-slate-400">Let's create something amazing</p>
                  <p className="mt-1 text-sm">Upload one or more photos to start editing with AI.</p>
                </div>
              ) : (
                <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                  <div className="flex flex-col items-center space-y-3">
                    <h3 className="text-lg font-semibold text-slate-300">Originals</h3>
                    {originalImages.length === 1 ? (
                      <div className="w-full aspect-square bg-slate-900/50 rounded-xl border-2 border-slate-700 flex items-center justify-center overflow-hidden relative group">
                        <img src={originalImages[0].url} alt="Original" className="w-full h-full object-contain" />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 flex items-center justify-center transition-all duration-300 opacity-0 group-hover:opacity-100">
                          <button
                            onClick={() => handleViewFullscreen(originalImages[0].url)}
                            className="p-3 bg-slate-900/60 backdrop-blur-sm rounded-full text-white hover:bg-slate-900/80 transition-all duration-200 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-slate-200"
                            aria-label="View Original in fullscreen"
                            title="View Original in fullscreen"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 0h-4m4 0l-5-5" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full aspect-square bg-slate-900/50 rounded-xl border-2 border-slate-700 flex items-center justify-center overflow-hidden p-2">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 w-full h-full overflow-y-auto">
                            {originalImages.map((image, index) => (
                                <div key={index} className="aspect-square relative group bg-black rounded-md">
                                    <img src={image.url} alt={`Original ${index + 1}`} className="w-full h-full object-contain" />
                                    <button
                                        onClick={() => handleViewFullscreen(image.url)}
                                        className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 flex items-center justify-center transition-all duration-300 opacity-0 group-hover:opacity-100 cursor-pointer"
                                        aria-label={`View Original ${index + 1} in fullscreen`}
                                        title={`View Original ${index + 1} in fullscreen`}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 0h-4m4 0l-5-5" />
                                        </svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-center space-y-3">
                     <h3 className="text-lg font-semibold text-slate-300">
                        {showCompare && canCompare ? 'Compare Before & After' : 'Edited by GlowMint'}
                     </h3>
                     <div className="w-full aspect-square">
                        {(showCompare && canCompare) ? (
                          <ImageCompareSlider 
                            beforeImageUrl={originalImages[0].url} 
                            afterImageUrl={currentEditedImage!}
                          />
                        ) : (
                          <ImageDisplay
                            imageUrl={currentEditedImage}
                            isLoading={isLoading}
                            onViewFullscreen={handleViewFullscreen}
                            onCompare={handleToggleCompare}
                            canCompare={canCompare}
                          />
                        )}
                      </div>
                    
                      {currentEditedImage && !isLoading && (
                         <div className="w-full flex flex-col sm:flex-row items-center gap-3">
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
                  </div>
                </div>
            )}
             {apiResponseText && !isLoading && !showCompare && (
              <div className="mt-6 p-4 bg-slate-900/70 rounded-lg border border-slate-700">
                <p className="text-sm text-slate-400 font-semibold mb-2">AI Commentary:</p>
                <p className="text-slate-300 italic">"{apiResponseText}"</p>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer onOpenTutorial={handleOpenTutorial} />
    </div>
  );
};

export default App;