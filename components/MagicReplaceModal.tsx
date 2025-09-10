import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { ImageFile } from '../types';
import PromptInput from './PromptInput';

interface MagicReplaceModalProps {
  image: ImageFile;
  onClose: () => void;
  onApply: (maskBase64: string, replacementPrompt: string) => void;
}

const MagicReplaceModal: React.FC<MagicReplaceModalProps> = ({ image, onClose, onApply }) => {
  const imageCanvasRef = useRef<HTMLCanvasElement>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [brushSize, setBrushSize] = useState(40);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [tool, setTool] = useState<'brush' | 'eraser' | 'pan'>('brush');
  const [isGrabbing, setIsGrabbing] = useState(false);
  const [brushPreview, setBrushPreview] = useState({ x: -100, y: -100, visible: false });
  const [replacementPrompt, setReplacementPrompt] = useState('');
  
  const isDrawing = useRef(false);
  const isPanning = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });
  const panStart = useRef({ x: 0, y: 0 });
  
  const gestureState = useRef({
    panStart: { x: 0, y: 0 },
    zoomStart: 1,
    distStart: 0,
    midStart: { x: 0, y: 0 },
  });

  const history = useRef<ImageData[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isMaskEmpty, setIsMaskEmpty] = useState(true);

  const checkIsMaskEmpty = useCallback(() => {
    const maskCanvas = maskCanvasRef.current;
    if (!maskCanvas) return true;
    const ctx = maskCanvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return true;
    try {
      const imageData = ctx.getImageData(0, 0, maskCanvas.width, maskCanvas.height);
      for (let i = 3; i < imageData.data.length; i += 4) {
          if (imageData.data[i] > 0) return false;
      }
    } catch (e) {
      console.error("Could not get image data:", e);
      return true;
    }
    return true;
  }, []);

  useEffect(() => {
    const imageCanvas = imageCanvasRef.current;
    const maskCanvas = maskCanvasRef.current;
    const container = containerRef.current;
    if (!imageCanvas || !maskCanvas || !container) return;

    const imageCtx = imageCanvas.getContext('2d');
    const maskCtx = maskCanvas.getContext('2d');
    if (!imageCtx || !maskCtx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = image.url;
    img.onload = () => {
      imageCanvas.width = img.naturalWidth;
      imageCanvas.height = img.naturalHeight;
      maskCanvas.width = img.naturalWidth;
      maskCanvas.height = img.naturalHeight;
      
      imageCtx.drawImage(img, 0, 0);

      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;
      const scaleX = containerWidth / img.naturalWidth;
      const scaleY = containerHeight / img.naturalHeight;
      const initialZoom = Math.min(scaleX, scaleY, 1);

      setZoom(initialZoom);
      setPan({ 
        x: (containerWidth - img.naturalWidth * initialZoom) / 2,
        y: (containerHeight - img.naturalHeight * initialZoom) / 2
      });
      
      const blankMask = maskCtx.createImageData(maskCanvas.width, maskCanvas.height);
      history.current = [blankMask];
      setHistoryIndex(0);
      setIsMaskEmpty(true);
    };
  }, [image.url]);

  useEffect(() => {
    const maskCanvas = maskCanvasRef.current;
    if (!maskCanvas) return;
    const maskCtx = maskCanvas.getContext('2d');
    if (!maskCtx) return;

    if (historyIndex > -1) {
      const snapshot = history.current[historyIndex];
      if (snapshot) {
        maskCtx.putImageData(snapshot, 0, 0);
        setIsMaskEmpty(checkIsMaskEmpty());
      }
    }
  }, [historyIndex, checkIsMaskEmpty]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { 
      if (e.key === 'Escape') onClose();
      if ((e.target as HTMLElement)?.tagName === 'TEXTAREA') return;
      if (e.key.toLowerCase() === 'b') setTool('brush');
      if (e.key.toLowerCase() === 'e') setTool('eraser');
      if (e.key.toLowerCase() === 'v' || e.key === ' ' ) {
        e.preventDefault();
        setTool('pan');
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') { e.preventDefault(); handleUndo(); }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'z') { e.preventDefault(); handleRedo(); }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') { e.preventDefault(); handleRedo(); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const getDistance = (touches: TouchList | React.TouchList): number => Math.hypot(touches[0].clientX - touches[1].clientX, touches[0].clientY - touches[1].clientY);
  const getMidpoint = (touches: TouchList | React.TouchList): { x: number; y: number } => ({ x: (touches[0].clientX + touches[1].clientX) / 2, y: (touches[0].clientY + touches[1].clientY) / 2 });
  
  const getCanvasCoordinates = useCallback((clientX: number, clientY: number): { x: number, y: number } => {
    const container = containerRef.current;
    if (!container) return { x: 0, y: 0 };
    const rect = container.getBoundingClientRect();
    return { x: (clientX - rect.left - pan.x) / zoom, y: (clientY - rect.top - pan.y) / zoom };
  }, [pan, zoom]);

  const updateBrushPreview = useCallback((clientX: number, clientY: number, visible: boolean) => {
    if (tool === 'pan') {
      if (brushPreview.visible) setBrushPreview(p => ({...p, visible: false}));
      return;
    }
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    setBrushPreview({ x: clientX - rect.left, y: clientY - rect.top, visible });
  }, [tool, brushPreview.visible]);

  const startInteraction = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const nativeEvent = 'nativeEvent' in e ? e.nativeEvent : e;
    const isPrimaryAction = (nativeEvent instanceof MouseEvent && nativeEvent.button === 0) || ('touches' in e && e.touches.length === 1);
    const isSecondaryPanAction = (nativeEvent instanceof MouseEvent && (nativeEvent.button === 1 || nativeEvent.buttons === 4)) || ('touches' in e && e.touches.length === 2);
    
    const isTouchEvent = 'touches' in e;
    const clientX = isTouchEvent ? e.touches[0].clientX : (nativeEvent as MouseEvent).clientX;
    const clientY = isTouchEvent ? e.touches[0].clientY : (nativeEvent as MouseEvent).clientY;

    updateBrushPreview(clientX, clientY, true);

    if (isSecondaryPanAction || (isPrimaryAction && tool === 'pan')) {
        isPanning.current = true;
        isDrawing.current = false;
        setIsGrabbing(true);

        if (isTouchEvent && e.touches.length === 2) {
             gestureState.current = { panStart: { ...pan }, zoomStart: zoom, distStart: getDistance(e.touches), midStart: getMidpoint(e.touches) };
        } else {
            panStart.current = { x: clientX - pan.x, y: clientY - pan.y };
        }
    } else if (isPrimaryAction && (tool === 'brush' || tool === 'eraser')) {
        isDrawing.current = true;
        isPanning.current = false;
        const pos = getCanvasCoordinates(clientX, clientY);
        lastPos.current = pos;
        const ctx = maskCanvasRef.current?.getContext('2d');
        if (!ctx) return;
        ctx.globalCompositeOperation = tool === 'brush' ? 'source-over' : 'destination-out';
        ctx.fillStyle = tool === 'brush' ? 'rgba(94, 234, 212, 0.7)' : 'black'; // Teal brush
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, brushSize / 2 / zoom, 0, Math.PI * 2);
        ctx.fill();
    }
  }, [tool, getCanvasCoordinates, updateBrushPreview, pan, zoom, brushSize]);

  const continueInteraction = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const isTouchEvent = 'touches' in e;
    const clientX = isTouchEvent ? e.touches[0].clientX : (e.nativeEvent as MouseEvent).clientX;
    const clientY = isTouchEvent ? e.touches[0].clientY : (e.nativeEvent as MouseEvent).clientY;
    
    updateBrushPreview(clientX, clientY, true);
    
    if (isPanning.current) {
        if ('touches' in e && e.touches.length === 2) {
            const { panStart, zoomStart, distStart, midStart } = gestureState.current;
            const newZoom = Math.min(Math.max(0.1, zoomStart * (getDistance(e.touches) / distStart)), 10);
            const midNow = getMidpoint(e.touches);
            setZoom(newZoom);
            setPan({ x: midNow.x - ((midStart.x - panStart.x) / zoomStart) * newZoom, y: midNow.y - ((midStart.y - panStart.y) / zoomStart) * newZoom });
        } else if (!('touches' in e)) {
            setPan({ x: clientX - panStart.current.x, y: clientY - panStart.current.y });
        }
    } else if (isDrawing.current) {
        const pos = getCanvasCoordinates(clientX, clientY);
        const ctx = maskCanvasRef.current?.getContext('2d');
        if (!ctx) return;
        ctx.lineWidth = brushSize / zoom;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = tool === 'brush' ? 'rgba(94, 234, 212, 0.7)' : 'black';
        ctx.globalCompositeOperation = tool === 'brush' ? 'source-over' : 'destination-out';
        ctx.beginPath();
        ctx.moveTo(lastPos.current.x, lastPos.current.y);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
        lastPos.current = pos;
    }
  }, [brushSize, getCanvasCoordinates, updateBrushPreview, zoom, tool]);
  
  const stopInteraction = useCallback(() => {
    if (isDrawing.current) {
      const canvas = maskCanvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (ctx) {
        const newHistory = history.current.slice(0, historyIndex + 1);
        newHistory.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
        history.current = newHistory;
        setHistoryIndex(newHistory.length - 1);
      }
    }
    isDrawing.current = false;
    isPanning.current = false;
    setIsGrabbing(false);
  }, [historyIndex]);

  const handlePointerMove = useCallback((e: React.MouseEvent) => { updateBrushPreview(e.clientX, e.clientY, true); continueInteraction(e); }, [continueInteraction, updateBrushPreview]);
  const handlePointerLeave = useCallback(() => { updateBrushPreview(0, 0, false); stopInteraction(); }, [stopInteraction, updateBrushPreview]);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const scaleAmount = -e.deltaY * 0.001;
    const newZoom = Math.min(Math.max(0.1, zoom + scaleAmount), 10);
    const rect = containerRef.current!.getBoundingClientRect();
    const mouseX = e.clientX - rect.left, mouseY = e.clientY - rect.top;
    setZoom(newZoom);
    setPan({ x: mouseX - ((mouseX - pan.x) / zoom) * newZoom, y: mouseY - ((mouseY - pan.y) / zoom) * newZoom });
  };

  const handleUndo = useCallback(() => { if (historyIndex > 0) setHistoryIndex(historyIndex - 1); }, [historyIndex]);
  const handleRedo = useCallback(() => { if (historyIndex < history.current.length - 1) setHistoryIndex(historyIndex + 1); }, [historyIndex]);
  const handleResetMask = useCallback(() => { if (history.current.length > 0) { history.current = [history.current[0]]; setHistoryIndex(0); } }, []);

  const handleApply = () => {
    const maskCanvas = maskCanvasRef.current;
    if (!maskCanvas) return;
    const finalMaskCanvas = document.createElement('canvas');
    finalMaskCanvas.width = maskCanvas.width;
    finalMaskCanvas.height = maskCanvas.height;
    const finalMaskCtx = finalMaskCanvas.getContext('2d');
    if (!finalMaskCtx) return;
    finalMaskCtx.fillStyle = 'black';
    finalMaskCtx.fillRect(0, 0, finalMaskCanvas.width, finalMaskCanvas.height);
    finalMaskCtx.drawImage(maskCanvas, 0, 0);
    finalMaskCtx.globalCompositeOperation = 'source-in';
    finalMaskCtx.fillStyle = 'white';
    finalMaskCtx.fillRect(0, 0, finalMaskCanvas.width, finalMaskCanvas.height);
    onApply(finalMaskCanvas.toDataURL('image/png').split(',')[1], replacementPrompt);
  };
  
  const getCursor = () => {
    if (tool === 'brush' || tool === 'eraser') return 'cursor-none';
    if (isGrabbing) return 'cursor-grabbing';
    return 'cursor-grab';
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 flex flex-col justify-center items-center z-50 backdrop-blur-lg animate-fade-in p-4" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-2xl w-full max-w-6xl h-full max-h-[90vh] flex flex-col p-4">
        <div className="flex-shrink-0 flex flex-col xl:flex-row justify-between items-center gap-4 p-2 mb-4 rounded-md bg-slate-900/50">
             <h2 className="text-xl font-bold text-slate-200">Magic Replace: Paint to replace</h2>
            <div className="flex-grow w-full xl:w-auto">
                 <PromptInput prompt={replacementPrompt} setPrompt={setReplacementPrompt} isDisabled={false} rows={1} placeholder="Replace selection with... e.g., 'a cute kitten'"/>
            </div>
            <div className="flex items-center gap-4 flex-wrap justify-center">
                <div className="flex items-center gap-2 border-l border-r border-slate-700 px-4">
                    <button onClick={() => setTool('pan')} className={`p-2 rounded-md transition-all ${tool === 'pan' ? 'bg-teal-600' : 'bg-slate-700'}`} title="Pan (V or Space)"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zm-7.518-.267A8.25 8.25 0 1120.25 10.5M8.288 14.212A5.25 5.25 0 1117.25 10.5" /></svg></button>
                    <button onClick={() => setTool('brush')} className={`p-2 rounded-md transition-all ${tool === 'brush' ? 'bg-teal-600' : 'bg-slate-700'}`} title="Brush (B)"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button>
                    <button onClick={() => setTool('eraser')} className={`p-2 rounded-md transition-all ${tool === 'eraser' ? 'bg-teal-600' : 'bg-slate-700'}`} title="Eraser (E)"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m5.231 13.481L15 17.25m-4.5-1.5 1.5-1.5m-6.5-1.5H5.25m11.9-3.664A2.25 2.25 0 0 0 15 2.25h-1.5a2.25 2.25 0 0 0-2.25 2.25v1.5A2.25 2.25 0 0 0 13.5 9H15a2.25 2.25 0 0 0 2.25-2.25 2.25 2.25 0 0 0-.084-3.664M6.75 18a2.25 2.25 0 0 1-2.25-2.25V13.5A2.25 2.25 0 0 1 6.75 11.25h1.5a2.25 2.25 0 0 1 2.25 2.25v2.25A2.25 2.25 0 0 1 9 18h-2.25Z" /></svg></button>
                </div>
                <div className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    <input type="range" min="5" max="200" value={brushSize} onChange={(e) => setBrushSize(Number(e.target.value))} disabled={tool === 'pan'} className="w-32" title="Brush Size"/>
                </div>
                 <div className="flex items-center gap-2">
                    <button onClick={handleUndo} disabled={historyIndex <= 0} className="p-2 bg-slate-700 rounded-md disabled:opacity-50" title="Undo (Ctrl+Z)"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 15l-3-3m0 0l3-3m-3 3h8a5 5 0 015 5v1" /></svg></button>
                    <button onClick={handleRedo} disabled={historyIndex >= history.current.length - 1} className="p-2 bg-slate-700 rounded-md disabled:opacity-50" title="Redo (Ctrl+Y)"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 15l3-3m0 0l-3-3m3 3H8a5 5 0 00-5 5v1" /></svg></button>
                    <button onClick={handleResetMask} disabled={isMaskEmpty} className="p-2 bg-slate-700 rounded-md disabled:opacity-50" title="Clear Mask"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <button onClick={onClose} className="py-2 px-5 bg-slate-600 hover:bg-slate-500 font-bold rounded-lg">Cancel</button>
                <button onClick={handleApply} disabled={isMaskEmpty || !replacementPrompt.trim()} className="py-2 px-5 bg-teal-600 hover:bg-teal-500 font-bold rounded-lg disabled:bg-teal-600/50 disabled:cursor-not-allowed">Apply Replace</button>
            </div>
        </div>
        <div ref={containerRef} className={`flex-grow bg-slate-900 rounded-lg overflow-hidden relative ${getCursor()}`} onMouseDown={startInteraction} onMouseMove={handlePointerMove} onMouseUp={stopInteraction} onMouseLeave={handlePointerLeave} onTouchStart={startInteraction} onTouchMove={continueInteraction} onTouchEnd={stopInteraction} onWheel={handleWheel}>
            <div style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, transformOrigin: '0 0' }}>
              <canvas ref={imageCanvasRef} className="absolute top-0 left-0" />
              <canvas ref={maskCanvasRef} className="absolute top-0 left-0" />
            </div>
             {tool !== 'pan' && (
              <div className={`absolute pointer-events-none rounded-full border-2 ${tool === 'brush' ? 'border-white bg-teal-500/30' : 'border-red-500 bg-red-500/20'} ${brushPreview.visible ? 'opacity-100' : 'opacity-0'}`} style={{ width: brushSize, height: brushSize, left: brushPreview.x, top: brushPreview.y, transform: `translate(-50%, -50%)` }}/>
            )}
        </div>
      </div>
    </div>
  );
};

export default MagicReplaceModal;