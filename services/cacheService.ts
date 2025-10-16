import type { EditResult } from './geminiService';

// A simple wrapper around IndexedDB for robust client-side caching.
class IndexedDBCache {
  private db: IDBDatabase | null = null;
  private readonly dbName = 'GlowMintCache';
  private readonly storeName = 'apiResponses';

  constructor() {
    this.init();
  }

  private init(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.db) {
        resolve();
        return;
      }

      const request = indexedDB.open(this.dbName, 1);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: 'key' });
        }
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        resolve();
      };

      request.onerror = (event) => {
        console.error('IndexedDB error:', (event.target as IDBOpenDBRequest).error);
        reject('Error opening IndexedDB.');
      };
    });
  }

  private async getDb(): Promise<IDBDatabase> {
    if (!this.db) {
      await this.init();
    }
    return this.db!;
  }

  public async get<T>(key: string): Promise<T | undefined> {
    const db = await this.getDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.get(key);

      request.onsuccess = () => {
        resolve(request.result?.value);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  public async set<T>(key: string, value: T): Promise<void> {
    const db = await this.getDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.put({ key, value });

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }
  
  public async has(key: string): Promise<boolean> {
     const db = await this.getDb();
     return new Promise((resolve, reject) => {
        const transaction = db.transaction(this.storeName, 'readonly');
        const store = transaction.objectStore(this.storeName);
        const request = store.count(key);
        
        request.onsuccess = () => {
            resolve(request.result > 0);
        };
        
        request.onerror = () => {
            reject(request.error);
        };
     });
  }
}

const dbCache = new IndexedDBCache();

const hashString = async (input: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

interface CacheableInput {
  base64ImageData: string;
  mimeType: string;
}

export const createCacheKey = async (
  images: CacheableInput[],
  prompt: string,
  mask?: CacheableInput
): Promise<string> => {
  let combinedString = prompt;

  for (const image of images) {
    // Hashing the full base64 string is slow. We hash a deterministic slice for performance.
    const slice = image.base64ImageData.substring(0, 1024) + image.base64ImageData.substring(image.base64ImageData.length - 1024);
    combinedString += `::image::${slice}`;
  }

  if (mask) {
    const slice = mask.base64ImageData.substring(0, 1024) + mask.base64ImageData.substring(mask.base64ImageData.length - 1024);
    combinedString += `::mask::${slice}`;
  }
  
  return hashString(combinedString);
};

// FIX: Replaced .bind() with arrow functions to preserve generic type information on the methods. This resolves an issue where TypeScript
// would lose the generic context, causing an "Untyped function calls may not accept type arguments" error when calling cacheService.get<T>().
export const cacheService = {
  get: <T>(key: string) => dbCache.get<T>(key),
  set: <T>(key: string, value: T) => dbCache.set<T>(key, value),
  has: (key: string) => dbCache.has(key),
};
