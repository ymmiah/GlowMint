import { GoogleGenAI, Modality, Type } from "@google/genai";
import type { GenerateContentResponse } from "@google/genai";
import { createCacheKey, cacheService } from './cacheService';

if (!process.env.API_KEY || process.env.API_KEY.trim() === '') {
  throw new Error("API_KEY environment variable is not set or is empty. This is required for the application to function.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export interface EditResult {
  editedImage: string | null;
  text: string | null;
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

export const generateText = async (prompt: string, responseSchema?: any): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
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
      // Add a slight delay for better UX, so it doesn't feel "broken" by being too fast.
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
        responseModalities: [Modality.IMAGE, Modality.TEXT],
      },
    });

    let editedImage: string | null = null;
    let text: string | null = null;

    const candidate = response.candidates?.[0];

    if (candidate && candidate.content && Array.isArray(candidate.content.parts)) {
      for (const part of candidate.content.parts) {
        if (part.inlineData) {
          editedImage = part.inlineData.data;
        } else if (part.text) {
          text = part.text;
        }
      }
    }
    
    // If no image is returned, check for a block reason or other feedback.
    if (!editedImage) {
        if (response.promptFeedback?.blockReason) {
            throw new Error(`GENERIC_ERROR::Request was blocked. Reason: ${response.promptFeedback.blockReason}. Please adjust your prompt or image.`);
        }
        console.warn("API response did not contain an image part and was not blocked. Response:", response);
    }
    
    const result: EditResult = { editedImage, text };

    if (result.editedImage) {
        try {
            await cacheService.set(cacheKey, result);
            console.log("Result saved to cache.");
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
