import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const isProd = process.env.NODE_ENV === 'production';

// Allow large payloads for base64 image data
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

function getAI(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
  if (!apiKey || apiKey.trim() === '') {
    throw new Error('INVALID_KEY::API key is not configured. Please set GEMINI_API_KEY in Settings > Secrets.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function handleServerError(res: express.Response, error: unknown) {
  console.error('[Gemini API Server Error]:', error);
  const msg = error instanceof Error ? error.message : String(error);
  const lower = msg.toLowerCase();

  if (msg.includes('INVALID_KEY::')) {
    return res.status(403).json({ error: msg });
  }
  if (
    lower.includes('permission_denied') ||
    lower.includes('403') ||
    lower.includes('api key not valid') ||
    lower.includes('invalid api key')
  ) {
    return res.status(403).json({
      error: 'INVALID_KEY::Your API key seems to be invalid or missing permissions. Please double-check it and try again.',
    });
  }
  if (lower.includes('quota') || lower.includes('429')) {
    return res.status(429).json({
      error: "QUOTA_EXCEEDED::You've reached your API usage limit. Please check your quota or try again later.",
    });
  }
  return res.status(500).json({ error: `GENERIC_ERROR::${msg}` });
}

function mapImageModel(model?: string): string {
  if (!model || model === 'gemini-2.5-flash-image' || model === 'gemini-3.1-flash-lite-image') {
    return 'gemini-3.1-flash-lite-image';
  }
  if (model === 'gemini-3.1-flash-image') {
    return 'gemini-3.1-flash-image';
  }
  return model;
}

function mapTextModel(model?: string): string {
  if (model === 'gemini-3-flash-preview') return 'gemini-3.8-flash';
  if (model === 'gemini-3.1-flash-lite-preview') return 'gemini-3.1-flash-lite';
  if (model === 'gemini-3.1-pro-preview') return 'gemini-3.1-pro-preview';
  return model || 'gemini-3.8-flash';
}

// 1. Generate Image
app.post('/api/gemini/generate-image', async (req, res) => {
  try {
    const { prompt, aspectRatio = '1:1', modelId } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'VALIDATION_ERROR::Prompt is required.' });
    }
    const ai = getAI();
    const targetModel = mapImageModel(modelId);

    const response = await ai.models.generateContent({
      model: targetModel,
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        imageConfig: {
          aspectRatio,
        },
      },
    });

    let base64ImageBytes: string | undefined;
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData?.data) {
        base64ImageBytes = part.inlineData.data;
        break;
      }
    }

    if (!base64ImageBytes) {
      return res.status(500).json({
        error: 'GENERIC_ERROR::The AI did not return an image. Your prompt might have been blocked by safety filters.',
      });
    }

    return res.json({ editedImage: base64ImageBytes });
  } catch (error) {
    return handleServerError(res, error);
  }
});

// 2. Edit Image
app.post('/api/gemini/edit-image', async (req, res) => {
  try {
    const { images, prompt, mask, modelId } = req.body;
    if (!images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({ error: 'VALIDATION_ERROR::Images are required.' });
    }
    if (!prompt) {
      return res.status(400).json({ error: 'VALIDATION_ERROR::Prompt is required.' });
    }

    const ai = getAI();
    const targetModel = mapImageModel(modelId);

    const imageParts = images.map((image: { base64ImageData: string; mimeType: string }) => ({
      inlineData: {
        data: image.base64ImageData,
        mimeType: image.mimeType,
      },
    }));

    const maskPart = mask ? [{
      inlineData: {
        data: mask.base64ImageData,
        mimeType: mask.mimeType,
      },
    }] : [];

    const textPart = { text: prompt };

    const response = await ai.models.generateContent({
      model: targetModel,
      contents: {
        parts: [...imageParts, ...maskPart, textPart],
      },
    });

    const imagePart = response.candidates?.[0]?.content?.parts?.find(part => part.inlineData);
    const editedImage = imagePart?.inlineData?.data || null;

    if (!editedImage) {
      if (response.promptFeedback?.blockReason) {
        return res.status(400).json({
          error: `GENERIC_ERROR::Request was blocked by safety filters. Reason: ${response.promptFeedback.blockReason}.`,
        });
      }
      return res.status(500).json({
        error: 'GENERIC_ERROR::The model failed to produce an image for this request.',
      });
    }

    return res.json({ editedImage });
  } catch (error) {
    return handleServerError(res, error);
  }
});

// 3. Generate Text
app.post('/api/gemini/generate-text', async (req, res) => {
  try {
    const { model, prompt, responseSchema } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'VALIDATION_ERROR::Prompt is required.' });
    }

    const ai = getAI();
    const targetModel = mapTextModel(model);

    const response = await ai.models.generateContent({
      model: targetModel,
      contents: prompt,
      config: responseSchema ? {
        responseMimeType: 'application/json',
        responseSchema,
      } : undefined,
    });

    return res.json({ text: response.text });
  } catch (error) {
    return handleServerError(res, error);
  }
});

// 4. Analyze Image
app.post('/api/gemini/analyze-image', async (req, res) => {
  try {
    const { model, image, prompt, useThinkingBudget } = req.body;
    if (!image || !image.base64ImageData) {
      return res.status(400).json({ error: 'VALIDATION_ERROR::Image is required.' });
    }
    if (!prompt) {
      return res.status(400).json({ error: 'VALIDATION_ERROR::Prompt is required.' });
    }

    const ai = getAI();
    const targetModel = mapTextModel(model);

    const imagePart = {
      inlineData: {
        mimeType: image.mimeType,
        data: image.base64ImageData,
      },
    };
    const textPart = { text: prompt };

    const response = await ai.models.generateContent({
      model: targetModel,
      contents: { parts: [imagePart, textPart] },
      config: useThinkingBudget ? {
        thinkingConfig: { thinkingBudget: 32768 },
      } : undefined,
    });

    return res.json({ text: response.text });
  } catch (error) {
    return handleServerError(res, error);
  }
});

// Vite middleware or Static files
async function startServer() {
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`GlowMint server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
