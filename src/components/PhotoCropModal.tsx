"use client";

import { useState, useRef, useCallback, useEffect } from "react";

interface PhotoCropModalProps {
  file: File;
  onConfirm: (croppedBase64: string) => void;
  onCancel: () => void;
  accent?: "green" | "pink";
}

const CONTAINER = 240;
const OUTPUT = 200;

export default function PhotoCropModal({
  file,
  onConfirm,
  onCancel,
  accent = "pink",
}: PhotoCropModalProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [naturalSize, setNaturalSize] = useState({ w: 0, h: 0 });
  const [zoom, setZoom] = useState(1);
  const [drag, setDrag] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [processing, setProcessing] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, dx: 0, dy: 0 });
  const imgEl = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setImageSrc(url);
    const img = new Image();
    img.onload = () => {
      setNaturalSize({ w: img.naturalWidth, h: img.naturalHeight });
      imgEl.current = img;
    };
    img.src = url;
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const coverScale =
    naturalSize.w && naturalSize.h
      ? Math.max(CONTAINER / naturalSize.w, CONTAINER / naturalSize.h)
      : 1;

  const clamp = useCallback(
    (dx: number, dy: number, z?: number) => {
      const zz = z ?? zoom;
      const dw = naturalSize.w * coverScale * zz;
      const dh = naturalSize.h * coverScale * zz;
      const maxX = Math.max(0, (dw - CONTAINER) / 2);
      const maxY = Math.max(0, (dh - CONTAINER) / 2);
      return {
        x: Math.max(-maxX, Math.min(maxX, dx)),
        y: Math.max(-maxY, Math.min(maxY, dy)),
      };
    },
    [zoom, naturalSize, coverScale],
  );

  const displayW = naturalSize.w * coverScale * zoom;
  const displayH = naturalSize.h * coverScale * zoom;
  const imgLeft = (CONTAINER - displayW) / 2 + drag.x;
  const imgTop = (CONTAINER - displayH) / 2 + drag.y;

  function onPointerDown(e: React.PointerEvent) {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY, dx: drag.x, dy: drag.y };
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!dragging) return;
    setDrag(
      clamp(
        dragStart.current.dx + e.clientX - dragStart.current.x,
        dragStart.current.dy + e.clientY - dragStart.current.y,
      ),
    );
  }

  function onPointerUp() {
    setDragging(false);
  }

  function handleZoom(z: number) {
    setZoom(z);
    setDrag(clamp(drag.x, drag.y, z));
  }

  async function handleConfirm() {
    if (!imgEl.current) return;
    setProcessing(true);

    const canvas = document.createElement("canvas");
    canvas.width = OUTPUT;
    canvas.height = OUTPUT;
    const ctx = canvas.getContext("2d")!;

    // Map the visible container area back to natural image coordinates
    const srcX = -imgLeft / (coverScale * zoom);
    const srcY = -imgTop / (coverScale * zoom);
    const srcSize = CONTAINER / (coverScale * zoom);

    ctx.beginPath();
    ctx.arc(OUTPUT / 2, OUTPUT / 2, OUTPUT / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();

    ctx.drawImage(imgEl.current, srcX, srcY, srcSize, srcSize, 0, 0, OUTPUT, OUTPUT);

    const base64 = canvas.toDataURL("image/jpeg", 0.8);
    onConfirm(base64);
    setProcessing(false);
  }

  if (!imageSrc) return null;

  const btnClass =
    accent === "green"
      ? "bg-green hover:bg-green/90"
      : "bg-pink hover:bg-pink/90";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-xs animate-fade-in">
        <h3 className="text-lg font-bold text-foreground mb-4 text-center">
          Ajustar foto
        </h3>

        {/* Crop area */}
        <div
          className="mx-auto rounded-full overflow-hidden relative select-none"
          style={{
            width: CONTAINER,
            height: CONTAINER,
            cursor: dragging ? "grabbing" : "grab",
            touchAction: "none",
          }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
        >
          <div className="absolute inset-0 bg-gray-100" />
          <img
            src={imageSrc}
            alt="Preview"
            draggable={false}
            className="absolute pointer-events-none"
            style={{
              width: displayW,
              height: displayH,
              left: imgLeft,
              top: imgTop,
            }}
          />
        </div>

        {/* Zoom slider */}
        <div className="mt-4 flex items-center gap-3 px-2">
          <svg
            className="h-4 w-4 text-gray-400 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7"
            />
          </svg>
          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            onChange={(e) => handleZoom(parseFloat(e.target.value))}
            className="flex-1 h-1.5 rounded-full appearance-none bg-gray-200 cursor-pointer
              [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4
              [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:bg-foreground [&::-webkit-slider-thumb]:cursor-pointer"
          />
          <svg
            className="h-4 w-4 text-gray-400 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7"
            />
          </svg>
        </div>

        <p className="text-xs text-gray-400 text-center mt-2">
          Arrastra para mover · Desliza para zoom
        </p>

        {/* Buttons */}
        <div className="mt-4 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={processing}
            className="flex-1 rounded-full border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={processing}
            className={`flex-1 rounded-full ${btnClass} px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50 transition-colors`}
          >
            {processing ? "Procesando..." : "Confirmar"}
          </button>
        </div>
      </div>
    </div>
  );
}
