import React, { useState, useRef, useEffect } from 'react';

export interface TextOverlayData {
  id: string;
  text: string;
  style: string;
  x: number;
  y: number;
  fontSize?: number;
}

interface TextOverlayProps {
  overlay: TextOverlayData;
  updateOverlay: (id: string, data: Partial<TextOverlayData>) => void;
  removeOverlay: (id: string) => void;
  containerRef: React.RefObject<HTMLDivElement>;
}

export const getStyleClasses = (style: string) => {
  switch (style) {
    case 'Cinematic Title': return 'font-serif text-white drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] uppercase tracking-widest font-bold';
    case 'Handwritten Note': return 'font-mono italic text-gray-800 rotate-[-2deg] bg-white/50 px-2 rounded';
    case 'Meme Text': return 'font-sans font-black text-white uppercase drop-shadow-[0_2px_2px_rgba(0,0,0,1)]';
    case 'Elegant Script': return 'font-serif italic text-yellow-400 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]';
    case 'Futuristic HUD': return 'font-mono text-cyan-400 tracking-widest uppercase drop-shadow-[0_0_8px_rgba(0,255,255,0.8)]';
    default: return 'font-sans text-white drop-shadow-md';
  }
};

const TextOverlay: React.FC<TextOverlayProps> = ({ overlay, updateOverlay, removeOverlay, containerRef }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(overlay.text);
  const inputRef = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const currentFontSize = overlay.fontSize || 32;

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent | TouchEvent) => {
      if (!containerRef.current) return;
      
      if ('touches' in e && e.cancelable) {
        e.preventDefault();
      }
      
      const containerRect = containerRef.current.getBoundingClientRect();
      let clientX, clientY;
      
      if ('touches' in e) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else {
        clientX = e.clientX;
        clientY = e.clientY;
      }

      if (isDragging) {
        const x = ((clientX - containerRect.left) / containerRect.width) * 100;
        const y = ((clientY - containerRect.top) / containerRect.height) * 100;

        updateOverlay(overlay.id, { 
          x: Math.max(0, Math.min(100, x)), 
          y: Math.max(0, Math.min(100, y)) 
        });
      } else if (isResizing && overlayRef.current) {
        const rect = overlayRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const distance = Math.sqrt(Math.pow(clientX - centerX, 2) + Math.pow(clientY - centerY, 2));
        
        const newFontSize = Math.max(12, Math.min(200, distance * 0.8));
        updateOverlay(overlay.id, { fontSize: newFontSize });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleMouseMove, { passive: false });
      window.addEventListener('touchend', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleMouseMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging, isResizing, containerRef, overlay.id, updateOverlay]);

  const handleDoubleClick = () => {
    setIsEditing(true);
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 0);
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (text.trim() === '') {
      removeOverlay(overlay.id);
    } else {
      updateOverlay(overlay.id, { text });
    }
  };

  return (
    <div
      ref={overlayRef}
      className="absolute cursor-move group"
      style={{ 
        left: `${overlay.x}%`, 
        top: `${overlay.y}%`, 
        transform: 'translate(-50%, -50%)',
        zIndex: isDragging || isResizing ? 50 : 40,
        fontSize: `${currentFontSize}px`
      }}
      onMouseDown={(e) => {
        e.stopPropagation();
        if (!isEditing) {
          e.preventDefault();
          setIsDragging(true);
        }
      }}
      onTouchStart={(e) => {
        e.stopPropagation();
        if (!isEditing) {
          setIsDragging(true);
        }
      }}
      onDoubleClick={handleDoubleClick}
    >
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleBlur();
          }}
          className={`bg-black/50 outline-none border border-white/50 rounded px-2 py-1 ${getStyleClasses(overlay.style)}`}
          style={{ minWidth: '100px', textAlign: 'center', fontSize: 'inherit' }}
        />
      ) : (
        <div className="relative">
          <div className={`whitespace-nowrap select-none ${getStyleClasses(overlay.style)}`} style={{ fontSize: 'inherit' }}>
            {overlay.text}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              removeOverlay(overlay.id);
            }}
            className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs z-10"
          >
            ×
          </button>
          <div
            className="absolute -bottom-2 -right-2 w-4 h-4 bg-white border border-gray-400 rounded-full cursor-se-resize opacity-0 group-hover:opacity-100 transition-opacity z-10"
            onMouseDown={(e) => {
              e.stopPropagation();
              e.preventDefault();
              setIsResizing(true);
            }}
            onTouchStart={(e) => {
              e.stopPropagation();
              setIsResizing(true);
            }}
          />
        </div>
      )}
    </div>
  );
};

export default TextOverlay;
