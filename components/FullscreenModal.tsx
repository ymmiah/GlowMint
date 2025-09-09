import React, { useEffect } from 'react';

// Fullscreen Modal Component
interface FullscreenModalProps {
  imageUrl: string;
  onClose: () => void;
}

const FullscreenModal: React.FC<FullscreenModalProps> = ({ imageUrl, onClose }) => {
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
      className="fixed inset-0 bg-slate-900/80 flex justify-center items-center z-50 backdrop-blur-lg animate-fade-in"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div className="relative max-w-[90vw] max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
        <img src={imageUrl} alt="Fullscreen view" className="w-auto h-auto max-w-full max-h-full object-contain rounded-lg" />
      </div>
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white text-4xl hover:text-slate-300 transition-all duration-200 transform hover:scale-125 focus:outline-none focus:ring-2 focus:ring-slate-200 rounded-full"
        aria-label="Close fullscreen view"
      >
        &times;
      </button>
    </div>
  );
};

export default FullscreenModal;