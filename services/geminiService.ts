import { createCacheKey, cacheService } from './cacheService';

export interface EditResult {
  editedImage: string | null;
}

export interface ImageInput {
  base64ImageData: string;
  mimeType: string;
}

async function requestApi(endpoint: string, body: any): Promise<any> {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.error) {
    throw new Error(data.error || 'GENERIC_ERROR::Request failed');
  }
  return data;
}

export const generateImage = async (
  prompt: string,
  aspectRatio: '1:1' | '3:4' | '4:3' | '9:16' | '16:9',
  modelId: string = 'gemini-3.1-flash-lite-image'
): Promise<EditResult> => {
  return await requestApi('/api/gemini/generate-image', {
    prompt,
    aspectRatio,
    modelId,
  });
};

export const generateText = async (
  model: 'gemini-3-flash-preview' | 'gemini-3.1-flash-lite-preview' | string,
  prompt: string,
  responseSchema?: any
): Promise<string> => {
  const data = await requestApi('/api/gemini/generate-text', {
    model,
    prompt,
    responseSchema,
  });
  return data.text;
};

export const analyzeImage = async (
  model: 'gemini-3-flash-preview' | 'gemini-3.1-pro-preview' | string,
  image: ImageInput,
  prompt: string,
  useThinkingBudget: boolean = false
): Promise<string> => {
  const data = await requestApi('/api/gemini/analyze-image', {
    model,
    image,
    prompt,
    useThinkingBudget,
  });
  return data.text;
};

export const editImageWithNanoBanana = async (
  images: ImageInput[],
  prompt: string,
  mask?: ImageInput,
  modelId: string = 'gemini-3.1-flash-lite-image'
): Promise<EditResult> => {
  const cacheKey = await createCacheKey(images, prompt, mask);

  try {
    const cachedResult = await cacheService.get<EditResult>(cacheKey);
    if (cachedResult) {
      console.log('Returning result from cache.');
      await new Promise((resolve) => setTimeout(resolve, 150));
      return cachedResult;
    }
  } catch (e) {
    console.error('Cache read failed, proceeding with API call.', e);
  }

  console.log(`Cache miss, calling API for image editing with model: ${modelId}`);

  const result = await requestApi('/api/gemini/edit-image', {
    images,
    prompt,
    mask,
    modelId,
  });

  if (result.editedImage) {
    try {
      await cacheService.set(cacheKey, result);
    } catch (e) {
      console.error('Cache write failed.', e);
    }
  }

  return result;
};
