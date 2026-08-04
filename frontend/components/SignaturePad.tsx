'use client';

import { useRef, useCallback } from 'react';
import { RotateCcw, Check } from 'lucide-react';

interface SignaturePadProps {
  onSignatureChange: (signature: string) => void;
}

export default function SignaturePad({ onSignatureChange }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);

  const startDrawing = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(x, y);
    isDrawingRef.current = true;
  }, []);

  const draw = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#1f2937';
    ctx.lineTo(x, y);
    ctx.stroke();
  }, []);

  const stopDrawing = useCallback(() => {
    isDrawingRef.current = false;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const signature = canvas.toDataURL('image/png');
    onSignatureChange(signature);
  }, [onSignatureChange]);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    onSignatureChange('');
  }, [onSignatureChange]);

  return (
    <div className="space-y-4">
      <div className="border-2 border-gray-300 rounded-lg overflow-hidden bg-white">
        <canvas
          ref={canvasRef}
          width={500}
          height={250}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          className="w-full h-full bg-white cursor-crosshair touch-none"
        />
      </div>

      <div className="flex gap-3">
        <button
          onClick={clearCanvas}
          className="flex-1 flex items-center justify-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg transition"
        >
          <RotateCcw size={18} />
          Effacer
        </button>
      </div>

      <p className="text-xs text-gray-500 text-center">Signez ci-dessus avec votre souris ou stylet</p>
    </div>
  );
}
