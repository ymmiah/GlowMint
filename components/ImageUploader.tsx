import React, { useState, useRef, useCallback } from 'react';
import type { ImageFile } from '../types';

interface ImageUploaderProps {
  images: ImageFile[];
  onAddImages: (files: ImageFile[]) => void;
  onRemoveImage: (index: number) => void;
}

type UploadState = 'uploading' | 'error';
interface UploadStatus {
  id: string;
  name: string;
  state: UploadState;
  progress: number;
  error?: string;
}

const CircularProgressBar = ({ progress }: { progress: number }) => {
    const radius = 20;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (progress / 100) * circumference;

    return (
        <div className="relative w-12 h-12">
            <svg className="w-full h-full" viewBox="0 0 50 50">
                <circle
                    className="text-[--color-surface-2]"
                    strokeWidth="5"
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx="25"
                    cy="25"
                />
                <circle
                    className="text-[--color-primary]"
                    strokeWidth="5"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx="25"
                    cy="25"
                    style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%', transition: 'stroke-dashoffset 0.2s ease-out' }}
                />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-[--color-text-secondary]">
                {progress}%
            </span>
        </div>
    );
};


const ImageUploader: React.FC<ImageUploaderProps> = ({ images, onAddImages, onRemoveImage }) => {
  const [uploadStatuses, setUploadStatuses] = useState<UploadStatus[]>([]);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFiles = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const MAX_FILE_SIZE_MB = 20;
    const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
    
    const allFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
    if (allFiles.length === 0) return;
    
    const validFiles: File[] = [];
    const initialStatuses: UploadStatus[] = [];

    allFiles.forEach(file => {
        const id = `${file.name}-${file.size}-${file.lastModified}`;
        if (file.size > MAX_FILE_SIZE_BYTES) {
            initialStatuses.push({
                id,
                name: file.name,
                state: 'error',
                progress: 0,
                error: `File is too large (max ${MAX_FILE_SIZE_MB}MB).`
            });
        } else {
            validFiles.push(file);
            initialStatuses.push({
                id,
                name: file.name,
                state: 'uploading',
                progress: 0
            });
        }
    });

    setUploadStatuses(prev => [...prev, ...initialStatuses]);
    if (validFiles.length === 0) return;

    const filePromises = validFiles.map(file => {
        return new Promise<ImageFile | null>((resolve) => {
            const id = `${file.name}-${file.size}-${file.lastModified}`;
            const reader = new FileReader();

            reader.onprogress = (event) => {
                if (event.lengthComputable) {
                    const percent = Math.round((event.loaded / event.total) * 100);
                    setUploadStatuses(prev => prev.map(s => s.id === id ? { ...s, progress: percent } : s));
                }
            };

            reader.onloadend = () => {
                const url = reader.result as string;
                const base64 = url.split(',')[1];
                resolve({ url, base64, mimeType: file.type });
            };

            reader.onerror = (error) => {
                console.error("FileReader error:", error);
                const errorMessage = "Could not read file.";
                setUploadStatuses(prev => prev.map(s => s.id === id ? { ...s, state: 'error', error: errorMessage, progress: 100 } : s));
                resolve(null);
            };

            reader.readAsDataURL(file);
        });
    });

    const results = await Promise.all(filePromises);
    const newImageData = results.filter((r): r is ImageFile => r !== null);
    
    if (newImageData.length > 0) {
        onAddImages(newImageData);
    }

    // Give time for the 100% progress to show before removing successful uploads from the status list
    setTimeout(() => {
        setUploadStatuses(prev => prev.filter(s => s.state === 'error'));
    }, 1000);

  }, [onAddImages]);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    processFiles(event.target.files);
    if (event.target) {
      event.target.value = '';
    }
  }, [processFiles]);

  const handleDrop = useCallback((event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    processFiles(event.dataTransfer.files);
  }, [processFiles]);

  const handleDragOver = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  };
  
  const handleDragLeave = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  };
  
  const handleRemoveStatus = (id: string) => {
    setUploadStatuses(prev => prev.filter(s => s.id !== id));
  };

  return (
    <div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
        id="image-upload-input"
        multiple
      />
      <label
        htmlFor="image-upload-input"
        className={`w-full h-48 border-2 border-dashed rounded-lg flex flex-col justify-center items-center cursor-pointer transition-colors duration-300
          ${isDragging ? 'border-[--color-primary] bg-[--color-surface-2]/50' : 'border-[--color-surface-3] hover:border-[--color-primary] hover:bg-[--color-surface-2]/50'}
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        title="Click to select photos or drag and drop them here"
      >
        {images.length === 0 && uploadStatuses.length === 0 ? (
          <div className="text-center text-[--color-text-tertiary]">
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
            <p className="mt-2 text-sm font-semibold">Click to upload or drag & drop</p>
            <p className="text-xs">PNG, JPG, etc. You can also paste an image.</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 p-2 h-full w-full overflow-y-auto">
            {images.map((image, index) => (
              <div
                key={`${image.url.slice(0,30)}-${index}`}
                className="aspect-square bg-black rounded-md animate-fade-in relative group"
                style={{ animationDelay: `${index * 50}ms`, opacity: 0 }}
              >
                <img src={image.url} alt={`Preview ${index + 1}`} className="w-full h-full object-contain" />
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onRemoveImage(index);
                  }}
                  className="absolute top-1 right-1 bg-black bg-opacity-60 text-white rounded-full p-0.5 w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-500 transition-all duration-200 transform hover:scale-125"
                  aria-label={`Remove image ${index + 1}`}
                  title={`Remove image ${index + 1}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
            {uploadStatuses.map(status => {
                if (status.state === 'error') {
                    return (
                        <div key={status.id} title={status.error} className="aspect-square bg-[--color-error-bg]/30 border-2 border-[--color-error-border]/50 rounded-md animate-fade-in flex flex-col items-center justify-center p-1 relative group">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[--color-error-text]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-xs text-[--color-error-text] mt-2 text-center break-all truncate w-full px-1" title={status.name}>{status.name}</p>
                            <p className="text-xs text-[--color-error-text] font-semibold">Upload Failed</p>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleRemoveStatus(status.id);
                              }}
                              className="absolute top-1 right-1 bg-black bg-opacity-60 text-white rounded-full p-0.5 w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-500 transition-all duration-200 transform hover:scale-125"
                              aria-label={`Remove failed upload ${status.name}`}
                              title={`Remove failed upload`}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                        </div>
                    );
                }
                return ( // 'uploading' state
                    <div key={status.id} className="aspect-square bg-[--color-surface-1] rounded-md animate-fade-in flex flex-col items-center justify-center p-1">
                      <CircularProgressBar progress={status.progress} />
                      <p className="text-xs text-[--color-text-tertiary] mt-2 text-center break-all truncate w-full px-1" title={status.name}>{status.name}</p>
                    </div>
                );
            })}
             <div className="flex items-center justify-center aspect-square">
                 <div className="w-full h-full border-2 border-dashed border-[--color-surface-3] hover:border-[--color-primary] rounded-md flex items-center justify-center text-[--color-text-placeholder] hover:text-[--color-primary] transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                 </div>
            </div>
          </div>
        )}
      </label>
    </div>
  );
};

export default ImageUploader;