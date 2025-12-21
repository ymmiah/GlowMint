
import { GoogleGenAI, Modality, Type } from "@google/genai";
import type { GenerateContentResponse } from "@google/genai";
import { createCacheKey, cacheService } from './cacheService';

if (!process.env.API_KEY || process.env.API_KEY.trim() === '') {
  throw new Error("API_KEY environment variable is not set or is empty. This is required for the application to function.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export interface EditResult {
  editedImage: string | null;
}

export interface ImageInput {
  base64ImageData: string;
  mimeType: string;
}

const handleApiError = (error: unknown): Error => {
    if (error instanceof Error) {
        if (error.message.includes('::')) {
            return error;
        }
        const message = error.message.toLowerCase();
        if (message.includes("permission_denied") || message.includes("403") || message.includes("api key not valid")) {
            return new Error("INVALID_KEY::Your API key seems to be invalid or missing permissions. Please double-check it and try again.");
        } else if (message.includes("quota")) {
            return new Error("QUOTA_EXCEEDED::You've reached your API usage limit. Please check your quota in the Google AI console or try again later.");
        }
    }
    return new Error("GENERIC_ERROR::The AI seems to be having trouble right now. Please try again in a moment.");
}

export const generateImageWithImagen = async (
  prompt: string,
  aspectRatio: '1:1' | '3:4' | '4:3' | '9:16' | '16:9'
): Promise<EditResult> => {
  try {
    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: prompt,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/png',
        aspectRatio: aspectRatio,
      },
    });

    const base64ImageBytes: string | undefined = response.generatedImages?.[0]?.image.imageBytes;
    if (!base64ImageBytes) {
      throw new Error("GENERIC_ERROR::The AI did not return an image. Your prompt might have been blocked by safety filters.");
    }
    return { editedImage: base64ImageBytes };
  } catch (error) {
    console.error("Error generating image with Imagen:", error);
    throw handleApiError(error);
  }
};

export const generateText = async (
  model: 'gemini-2.5-flash' | 'gemini-2.5-flash-lite',
  prompt: string,
  responseSchema?: any
): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: responseSchema ? {
        responseMimeType: "application/json",
        responseSchema,
      } : undefined,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating text:", error);
    throw handleApiError(error);
  }
};

export const analyzeImage = async (
  model: 'gemini-2.5-flash' | 'gemini-3-pro-preview',
  image: ImageInput,
  prompt: string,
  useThinkingBudget: boolean = false
): Promise<string> => {
  try {
    const imagePart = {
      inlineData: {
        mimeType: image.mimeType,
        data: image.base64ImageData,
      },
    };
    const textPart = { text: prompt };

    const response = await ai.models.generateContent({
      model: model,
      contents: { parts: [imagePart, textPart] },
      config: useThinkingBudget ? {
        thinkingConfig: { thinkingBudget: 32768 }
      } : undefined,
    });

    return response.text;
  } catch (error) {
    console.error("Error analyzing image:", error);
    throw handleApiError(error);
  }
};


export const editImageWithNanoBanana = async (
  images: ImageInput[],
  prompt: string,
  mask?: ImageInput
): Promise<EditResult> => {
  const cacheKey = await createCacheKey(images, prompt, mask);
  
  try {
    const cachedResult = await cacheService.get<EditResult>(cacheKey);
    if (cachedResult) {
      console.log("Returning result from cache.");
      await new Promise(resolve => setTimeout(resolve, 150));
      return cachedResult;
    }
  } catch (e) {
      console.error("Cache read failed, proceeding with API call.", e);
  }

  console.log("Cache miss, calling Gemini API.");

  try {
    const imageParts = images.map(image => ({
      inlineData: {
        data: image.base64ImageData,
        mimeType: image.mimeType,
      },
    }));
    
    const maskPart = mask ? [{
        inlineData: {
            data: mask.base64ImageData,
            mimeType: mask.mimeType
        }
    }] : [];

    const textPart = { text: prompt };

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [...imageParts, ...maskPart, textPart],
      },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    const imagePart = response.candidates?.[0]?.content?.parts?.find(part => part.inlineData);
    const editedImage: string | null = imagePart?.inlineData?.data || null;
    
    if (!editedImage) {
        if (response.promptFeedback?.blockReason) {
            throw new Error(`GENERIC_ERROR::Request was blocked by safety filters. Reason: ${response.promptFeedback.blockReason}.`);
        }
        throw new Error("GENERIC_ERROR::The model failed to produce an image for this request.");
    }
    
    const result: EditResult = { editedImage };

    if (result.editedImage) {
        try {
            await cacheService.set(cacheKey, result);
        } catch(e) {
            console.error("Cache write failed.", e);
        }
    }

    return result;
    
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw handleApiError(error);
  }
};
