import React, { useState, useRef, useCallback, useEffect } from 'react';

interface ImageCompareSliderProps {
  beforeImageUrl: string;
  afterImageUrl: string;
}

const ImageCompareSlider: React.FC<ImageCompareSliderProps> = ({ beforeImageUrl, afterImageUrl }) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = (x / rect.width) * 100;
    setSliderPosition(percent);
  }, []);

  const handleInteractionStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleInteractionEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging) {
      handleMove(e.clientX);
    }
  }, [isDragging, handleMove]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (isDragging) {
      handleMove(e.touches[0].clientX);
    }
  }, [isDragging, handleMove]);

  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => handleMouseMove(e);
    const handleGlobalTouchMove = (e: TouchEvent) => handleTouchMove(e);
    
    window.addEventListener('mousemove', handleGlobalMouseMove);
    window.addEventListener('mouseup', handleInteractionEnd);
    window.addEventListener('touchmove', handleGlobalTouchMove);
    window.addEventListener('touchend', handleInteractionEnd);

    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleInteractionEnd);
      window.removeEventListener('touchmove', handleGlobalTouchMove);
      window.removeEventListener('touchend', handleInteractionEnd);
    };
  }, [handleMouseMove, handleInteractionEnd, handleTouchMove]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full relative select-none overflow-hidden rounded-xl border-2 border-[--color-border] group"
      onMouseUp={handleInteractionEnd}
      onMouseLeave={handleInteractionEnd}
    >
      {/* After Image (bottom layer) */}
      <img
        src={afterImageUrl}
        alt="After edit"
        draggable={false}
        className="absolute inset-0 w-full h-full object-contain pointer-events-none"
      />
      
      {/* Before Image (top layer, clipped) */}
      <div
        className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none"
        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
      >
        <img
          src={beforeImageUrl}
          alt="Before edit"
          draggable={false}
          className="absolute inset-0 w-full h-full object-contain"
        />
      </div>
      
      {/* Slider Handle */}
      <div
        className="absolute top-0 bottom-0 w-1 bg-white/75 cursor-ew-resize"
        style={{ left: `calc(${sliderPosition}% - 1px)` }}
        onMouseDown={handleInteractionStart}
        onTouchStart={handleInteractionStart}
      >
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 bg-white/80 rounded-full shadow-lg flex items-center justify-center backdrop-blur-sm border-2 border-white/50 group-hover:opacity-100 opacity-80 transition-opacity"
          aria-hidden="true"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[--color-bg]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default ImageCompareSlider;