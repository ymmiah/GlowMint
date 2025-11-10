import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { ImageFile } from '../types';

interface CropModalProps {
  image: ImageFile;
  onClose: () => void;
  onApply: (croppedImageBase64: string) => void;
  onApplyAI: (prompt: string) => void;
}

const aspectRatios = [
    { name: 'Freeform', value: 0 },
    { name: 'Square 1:1', value: 1/1 },
    { name: 'Portrait 4:5', value: 4/5 },
    { name: 'Landscape 16:9', value: 16/9 },
];

export const CropModal: React.FC<CropModalProps> = ({ image, onClose, onApply, onApplyAI }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(new Image());
  const [crop, setCrop] = useState({ x: 50, y: 50, width: 200, height: 200 });
  const [rotation, setRotation] = useState(0);
  const [activeAspectRatio, setActiveAspectRatio] = useState(aspectRatios[0]);
  
  const interaction = useRef<{
      type: 'move' | 'nw' | 'ne' | 'se' | 'sw' | null,
      startX: number,
      startY: number,
      startCrop: typeof crop
  }>({ type: null, startX: 0, startY: 0, startCrop: crop });

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const img = imageRef.current;
    if (!canvas || !ctx || !img.src) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Center and contain the image
    const canvasRatio = canvas.width / canvas.height;
    const imgRatio = img.width / img.height;
    let drawWidth = canvas.width;
    let drawHeight = canvas.height;
    if (imgRatio > canvasRatio) {
        drawHeight = canvas.width / imgRatio;
    } else {
        drawWidth = canvas.height * imgRatio;
    }
    const drawX = (canvas.width - drawWidth) / 2;
    const drawY = (canvas.height - drawHeight) / 2;

    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(rotation * Math.PI / 180);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);
    ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
    ctx.restore();

    // Draw overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Clear the crop area
    ctx.save();
    ctx.beginPath();
    ctx.rect(crop.x, crop.y, crop.width, crop.height);
    ctx.clip();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
    ctx.restore();
    
    // Draw crop box border and handles
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.lineWidth = 2;
    ctx.strokeRect(crop.x, crop.y, crop.width, crop.height);
    
    const handleSize = 8;
    ctx.fillStyle = 'white';
    // Corners
    ctx.fillRect(crop.x - handleSize/2, crop.y - handleSize/2, handleSize, handleSize);
    ctx.fillRect(crop.x + crop.width - handleSize/2, crop.y - handleSize/2, handleSize, handleSize);
    ctx.fillRect(crop.x + crop.width - handleSize/2, crop.y + crop.height - handleSize/2, handleSize, handleSize);
    ctx.fillRect(crop.x - handleSize/2, crop.y + crop.height - handleSize/2, handleSize, handleSize);

  }, [crop, rotation]);

  useEffect(() => {
    const img = imageRef.current;
    img.crossOrigin = "anonymous";
    img.src = image.url;
    img.onload = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      const { clientWidth, clientHeight } = container;
      canvas.width = clientWidth;
      canvas.height = clientHeight;

      // Set initial crop box
      const initialSize = Math.min(clientWidth, clientHeight) * 0.6;
      setCrop({
          x: (clientWidth - initialSize) / 2,
          y: (clientHeight - initialSize) / 2,
          width: initialSize,
          height: initialSize,
      });
    };
  }, [image.url]);
  
  useEffect(() => {
    draw();
  }, [draw]);

  const getInteractionType = (x: number, y: number) => {
    const handleSize = 16;
    if (Math.abs(x - crop.x) < handleSize && Math.abs(y - crop.y) < handleSize) return 'nw';
    if (Math.abs(x - (crop.x + crop.width)) < handleSize && Math.abs(y - crop.y) < handleSize) return 'ne';
    if (Math.abs(x - (crop.x + crop.width)) < handleSize && Math.abs(y - (crop.y + crop.height)) < handleSize) return 'se';
    if (Math.abs(x - crop.x) < handleSize && Math.abs(y - (crop.y + crop.height)) < handleSize) return 'sw';
    if (x > crop.x && x < crop.x + crop.width && y > crop.y && y < crop.y + crop.height) return 'move';
    return null;
  };

  const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    
    const type = getInteractionType(x, y);
    if (type) {
        interaction.current = { type, startX: x, startY: y, startCrop: { ...crop } };
    }
  };

  const handlePointerMove = useCallback((e: MouseEvent | TouchEvent) => {
      const { type, startX, startY, startCrop } = interaction.current;
      if (!type || !canvasRef.current) return;
      
      const rect = canvasRef.current.getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      const dx = (clientX - rect.left) - startX;
      const dy = (clientY - rect.top) - startY;

      let newCrop = { ...startCrop };
      
      if (type === 'move') {
          newCrop.x += dx;
          newCrop.y += dy;
      } else { // Resize
          if (type.includes('w')) { newCrop.x += dx; newCrop.width -= dx; }
          if (type.includes('n')) { newCrop.y += dy; newCrop.height -= dy; }
          if (type.includes('e')) { newCrop.width += dx; }
          if (type.includes('s')) { newCrop.height += dy; }
          
          if (newCrop.width < 0) { newCrop.x += newCrop.width; newCrop.width *= -1; }
          if (newCrop.height < 0) { newCrop.y += newCrop.height; newCrop.height *= -1; }

          if (activeAspectRatio.value > 0) {
              newCrop.height = newCrop.width / activeAspectRatio.value;
          }
      }
      setCrop(newCrop);
  }, [activeAspectRatio.value]);

  const handlePointerUp = () => {
      interaction.current.type = null;
  };

  useEffect(() => {
    const moveHandler = (e: MouseEvent | TouchEvent) => handlePointerMove(e);
    const upHandler = () => handlePointerUp();
    window.addEventListener('mousemove', moveHandler);
    window.addEventListener('touchmove', moveHandler);
    window.addEventListener('mouseup', upHandler);
    window.addEventListener('touchend', upHandler);
    return () => {
        window.removeEventListener('mousemove', moveHandler);
        window.removeEventListener('touchmove', moveHandler);
        window.removeEventListener('mouseup', upHandler);
        window.removeEventListener('touchend', upHandler);
    };
  }, [handlePointerMove]);
  
  const handleApply = () => {
    const img = imageRef.current;
    if (!img.src) return;

    const canvas = canvasRef.current!;
    const canvasRatio = canvas.width / canvas.height;
    const imgRatio = img.width / img.height;
    let drawWidth = canvas.width;
    let drawHeight = canvas.height;
    if (imgRatio > canvasRatio) {
        drawHeight = canvas.width / imgRatio;
    } else {
        drawWidth = canvas.height * imgRatio;
    }
    
    const scale = img.width / drawWidth;
    
    const sx = (crop.x - (canvas.width - drawWidth) / 2) * scale;
    const sy = (crop.y - (canvas.height - drawHeight) / 2) * scale;
    const sWidth = crop.width * scale;
    const sHeight = crop.height * scale;

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = sWidth;
    tempCanvas.height = sHeight;
    const tempCtx = tempCanvas.getContext('2d')!;

    tempCtx.save();
    tempCtx.translate(sWidth / 2, sHeight / 2);
    tempCtx.rotate(rotation * Math.PI / 180);
    tempCtx.drawImage(img, sx, sy, sWidth, sHeight, -sWidth / 2, -sHeight / 2, sWidth, sHeight);
    tempCtx.restore();

    onApply(tempCanvas.toDataURL('image/png').split(',')[1]);
  };

  const handleStraighten = () => {
    onClose(); // Close modal immediately
    onApplyAI("Analyze this image for a tilted horizon or perspective distortion and automatically straighten it. Crop the image slightly to remove any empty space created by the rotation, maintaining the original aspect ratio and composition as much as possible.");
  };

  return (
    <div className="fixed inset-0 bg-[--color-bg]/80 flex flex-col justify-center items-center z-50 backdrop-blur-lg animate-fade-in p-4" onClick={onClose}>
      <div className="bg-[--color-surface-1] border border-[--color-border] rounded-lg shadow-2xl w-full max-w-4xl h-full max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <header className="flex-shrink-0 flex items-center justify-between p-4 border-b border-[--color-border]">
            <h2 className="text-2xl font-bold text-[--color-text-primary] flex items-center gap-3">📏 Crop & Rotate</h2>
            <button onClick={onClose} className="text-[--color-text-tertiary] text-3xl hover:text-[--color-text-primary] transition-all" aria-label="Close">&times;</button>
        </header>
        <div className="flex-grow p-4 min-h-0">
             <div ref={containerRef} className="w-full h-full bg-[--color-surface-inset]">
                <canvas ref={canvasRef} className="w-full h-full" onMouseDown={handlePointerDown} onTouchStart={handlePointerDown} />
             </div>
        </div>
        <footer className="flex-shrink-0 flex flex-col sm:flex-row justify-between items-center gap-4 p-4 border-t border-[--color-border] bg-[--color-surface-1]/50">
            <div className='flex items-center gap-4'>
                <div className="flex items-center gap-3">
                    {aspectRatios.map(ar => (
                        <button key={ar.name} onClick={() => setActiveAspectRatio(ar)} className={`px-3 py-2 text-sm rounded-md border-2 ${activeAspectRatio.name === ar.name ? 'bg-[--color-primary] border-[--color-primary-hover] text-[--color-primary-text]' : 'bg-[--color-surface-2] border-[--color-border] text-[--color-text-secondary]'}`}>{ar.name}</button>
                    ))}
                </div>
                <div className="flex items-center gap-2">
                    <input type="range" min="-45" max="45" value={rotation} onChange={(e) => setRotation(Number(e.target.value))} className="w-24"/>
                    <span className="text-sm font-mono bg-[--color-surface-2] px-2 py-1 rounded">{rotation}°</span>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <button onClick={handleStraighten} className="py-2 px-5 bg-[--color-surface-3] hover:bg-[--color-text-placeholder] font-bold rounded-lg">Auto-Straighten ✨</button>
                <button onClick={handleApply} className="py-2 px-5 bg-[--color-primary] hover:bg-[--color-primary-hover] text-[--color-primary-text] font-bold rounded-lg">Apply Crop</button>
            </div>
        </footer>
      </div>
    </div>
  );
};