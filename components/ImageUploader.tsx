import React, { useState, useRef, useCallback } from 'react';
import type { ImageFile } from '../types';

interface ImageUploaderProps {
  images: ImageFile[];
  onAddImages: (files: ImageFile[]) => void;
  onRemoveImage: (index: number) => void;
}

interface UploadStatus {
  id: string;
  name: string;
  progress: number;
}

const CircularProgressBar = ({ progress }: { progress: number }) => {
    const radius = 20;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (progress / 100) * circumference;

    return (
        <div className="relative w-12 h-12">
            <svg className="w-full h-full" viewBox="0 0 50 50">
                <circle
                    className="text-slate-700"
                    strokeWidth="5"
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx="25"
                    cy="25"
                />
                <circle
                    className="text-teal-500"
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
            <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-slate-300">
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

    const newFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
    if (newFiles.length === 0) return;

    const currentUploads: UploadStatus[] = newFiles.map(file => ({
        id: `${file.name}-${file.size}-${file.lastModified}`,
        name: file.name,
        progress: 0,
    }));
    setUploadStatuses(prev => [...prev, ...currentUploads]);

    const filePromises = newFiles.map(file => {
        return new Promise<ImageFile>((resolve, reject) => {
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
                reject(error);
            };

            reader.readAsDataURL(file);
        });
    });

    try {
        const newImageData = await Promise.all(filePromises);
        onAddImages(newImageData);
    } catch (error) {
        console.error("Error processing files:", error);
    } finally {
        const currentIds = new Set(currentUploads.map(u => u.id));
        setUploadStatuses(prev => prev.filter(s => !currentIds.has(s.id)));
    }
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

  return (
    <div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/png, image/jpeg, image/webp"
        className="hidden"
        id="image-upload-input"
        multiple
      />
      <label
        htmlFor="image-upload-input"
        className={`w-full h-48 border-2 border-dashed rounded-lg flex flex-col justify-center items-center cursor-pointer transition-colors duration-300
          ${isDragging ? 'border-teal-500 bg-slate-700/50' : 'border-slate-600 hover:border-teal-500 hover:bg-slate-700/50'}
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        title="Click to select photos or drag and drop them here"
      >
        {images.length === 0 && uploadStatuses.length === 0 ? (
          <div className="text-center text-slate-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
            <p className="mt-2 text-sm font-semibold">Click to upload or drag & drop</p>
            <p className="text-xs">Upload one or more images (PNG, JPG, WEBP)</p>
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
            {uploadStatuses.map(status => (
                <div key={status.id} className="aspect-square bg-slate-800 rounded-md animate-fade-in flex flex-col items-center justify-center p-1">
                  <CircularProgressBar progress={status.progress} />
                  <p className="text-xs text-slate-400 mt-2 text-center break-all truncate w-full px-1" title={status.name}>{status.name}</p>
                </div>
            ))}
             <div className="flex items-center justify-center aspect-square">
                 <div className="w-full h-full border-2 border-dashed border-slate-600 hover:border-teal-500 rounded-md flex items-center justify-center text-slate-500 hover:text-teal-400 transition-colors">
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