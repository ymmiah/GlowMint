import React, { useEffect, useRef } from 'react';
import TextOverlay, { TextOverlayData } from './TextOverlay';

// Fullscreen Modal Component
interface FullscreenModalProps {
  imageUrl: string;
  onClose: () => void;
  textOverlays?: TextOverlayData[];
  updateTextOverlay?: (id: string, data: Partial<TextOverlayData>) => void;
  removeTextOverlay?: (id: string) => void;
}

const FullscreenModal: React.FC<FullscreenModalProps> = ({ 
  imageUrl, 
  onClose,
  textOverlays = [],
  updateTextOverlay,
  removeTextOverlay
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden'; // Prevent background scrolling

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-[--color-bg]/80 flex justify-center items-center z-50 backdrop-blur-lg animate-fade-in"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div className="relative max-w-[90vw] max-h-[90vh] inline-flex min-w-0 min-h-0" ref={containerRef} onClick={(e) => e.stopPropagation()}>
        <img src={imageUrl} alt="Fullscreen view" className="w-auto h-auto max-w-full max-h-full min-w-0 min-h-0 object-contain rounded-lg" />
        {textOverlays.map(overlay => (
          <TextOverlay 
            key={overlay.id} 
            overlay={overlay} 
            updateOverlay={updateTextOverlay!} 
            removeOverlay={removeTextOverlay!} 
            containerRef={containerRef} 
          />
        ))}
      </div>
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white text-4xl hover:text-[--color-text-secondary] transition-all duration-200 transform hover:scale-125 focus:outline-none focus:ring-2 focus:ring-white rounded-full"
        aria-label="Close fullscreen view"
      >
        &times;
      </button>
    </div>
  );
};

export default FullscreenModal;