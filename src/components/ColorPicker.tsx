'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { hexToHsl, hslToHex, isValidHex } from '@/lib/color';

interface ColorPickerProps {
  color: string;
  onChange: (hex: string) => void;
}

export default function ColorPicker({ color, onChange }: ColorPickerProps) {
  const [hue, setHue] = useState(0);
  const [saturation, setSaturation] = useState(100);
  const [lightness, setLightness] = useState(50);
  
  const slAreaRef = useRef<HTMLDivElement>(null);
  const hueSliderRef = useRef<HTMLDivElement>(null);
  const [isDraggingSL, setIsDraggingSL] = useState(false);
  const [isDraggingHue, setIsDraggingHue] = useState(false);

  // Sync from hex color
  useEffect(() => {
    if (isValidHex(color)) {
      const hsl = hexToHsl(color);
      if (hsl) {
        setHue(hsl.h);
        setSaturation(hsl.s);
        setLightness(hsl.l);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [color]);

  // Update color when HSL changes
  useEffect(() => {
    const hex = hslToHex(hue, saturation, lightness);
    if (hex !== color.toUpperCase()) {
      onChange(hex);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hue, saturation, lightness]);

  // Saturation/Lightness area handlers
  const handleSLMove = useCallback((clientX: number, clientY: number) => {
    if (!slAreaRef.current) return;
    const rect = slAreaRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const y = Math.max(0, Math.min(clientY - rect.top, rect.height));
    const s = Math.round((x / rect.width) * 100);
    const l = Math.round(100 - (y / rect.height) * 100);
    setSaturation(s);
    setLightness(l);
  }, []);

  const handleSLMouseDown = (e: React.MouseEvent) => {
    setIsDraggingSL(true);
    handleSLMove(e.clientX, e.clientY);
  };

  // Hue slider handlers
  const handleHueMove = useCallback((clientX: number) => {
    if (!hueSliderRef.current) return;
    const rect = hueSliderRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const h = Math.round((x / rect.width) * 360);
    setHue(h);
  }, []);

  const handleHueMouseDown = (e: React.MouseEvent) => {
    setIsDraggingHue(true);
    handleHueMove(e.clientX);
  };

  // Global mouse move/up handlers
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingSL) {
        handleSLMove(e.clientX, e.clientY);
      }
      if (isDraggingHue) {
        handleHueMove(e.clientX);
      }
    };

    const handleMouseUp = () => {
      setIsDraggingSL(false);
      setIsDraggingHue(false);
    };

    if (isDraggingSL || isDraggingHue) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingSL, isDraggingHue, handleSLMove, handleHueMove]);

  // Generate gradient for SL area
  const slGradient = `
    linear-gradient(to top, #000, transparent),
    linear-gradient(to right, #fff, hsl(${hue}, 100%, 50%))
  `;

  return (
    <div className="space-y-4">
      {/* Saturation/Lightness area */}
      <div
        ref={slAreaRef}
        className="relative w-full h-48 rounded-lg cursor-crosshair border border-gray-200"
        style={{
          background: slGradient,
        }}
        onMouseDown={handleSLMouseDown}
      >
        {/* Picker circle */}
        <div
          className="absolute w-4 h-4 rounded-full border-2 border-white shadow-md pointer-events-none -translate-x-1/2 -translate-y-1/2"
          style={{
            left: `${saturation}%`,
            top: `${100 - lightness}%`,
            backgroundColor: color,
          }}
        />
      </div>

      {/* Hue slider */}
      <div
        ref={hueSliderRef}
        className="relative w-full h-6 rounded-full cursor-pointer border border-gray-200"
        style={{
          background: 'linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)',
        }}
        onMouseDown={handleHueMouseDown}
      >
        {/* Hue indicator */}
        <div
          className="absolute top-1/2 w-4 h-4 rounded-full border-2 border-white shadow-md pointer-events-none -translate-x-1/2 -translate-y-1/2"
          style={{
            left: `${(hue / 360) * 100}%`,
            backgroundColor: `hsl(${hue}, 100%, 50%)`,
          }}
        />
      </div>

      {/* Color preview and HEX input */}
      <div className="flex items-center gap-3">
        <div
          className="w-12 h-12 rounded-lg border border-gray-200 flex-shrink-0"
          style={{ backgroundColor: color }}
        />
        <div className="flex-1">
          <label className="text-xs text-gray-500 mb-1 block">HEX</label>
          <input
            type="text"
            value={color}
            onChange={(e) => {
              const val = e.target.value;
              if (isValidHex(val)) {
                const hsl = hexToHsl(val);
                if (hsl) {
                  setHue(hsl.h);
                  setSaturation(hsl.s);
                  setLightness(hsl.l);
                }
              }
              onChange(val);
            }}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 font-mono text-sm focus:border-brand-600 outline-none"
          />
        </div>
      </div>

      {/* HSL values */}
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div>
          <label className="text-gray-500 block mb-1">H</label>
          <input
            type="number"
            min={0}
            max={360}
            value={hue}
            onChange={(e) => setHue(Number(e.target.value))}
            className="w-full px-2 py-1 rounded border border-gray-300 font-mono"
          />
        </div>
        <div>
          <label className="text-gray-500 block mb-1">S</label>
          <input
            type="number"
            min={0}
            max={100}
            value={saturation}
            onChange={(e) => setSaturation(Number(e.target.value))}
            className="w-full px-2 py-1 rounded border border-gray-300 font-mono"
          />
        </div>
        <div>
          <label className="text-gray-500 block mb-1">L</label>
          <input
            type="number"
            min={0}
            max={100}
            value={lightness}
            onChange={(e) => setLightness(Number(e.target.value))}
            className="w-full px-2 py-1 rounded border border-gray-300 font-mono"
          />
        </div>
      </div>
    </div>
  );
}
