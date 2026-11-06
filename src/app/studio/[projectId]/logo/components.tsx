'use client';

import { useEffect, useState } from 'react';
import { renderLogo, type RenderResult } from '@/lib/logo/render';
import type { LogoColorway, LogoDesign } from '@/lib/logo/types';

/** Renders a design to outlined SVG (async: fonts are loaded and converted to paths). */
export function useRendered(design: LogoDesign | null, colorway: LogoColorway = 'color', padding = 0.5) {
  const [result, setResult] = useState<RenderResult | null>(null);
  const key = design ? JSON.stringify(design) + colorway + padding : '';
  useEffect(() => {
    if (!design) {
      setResult(null);
      return;
    }
    let live = true;
    renderLogo(design, { colorway, padding }).then((r) => {
      if (live) setResult(r);
    });
    return () => {
      live = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return result;
}

export function LogoThumb({
  design,
  colorway = 'color',
  className = '',
}: {
  design: LogoDesign;
  colorway?: LogoColorway;
  className?: string;
}) {
  const r = useRendered(design, colorway);
  if (!r) return <div className={`animate-pulse bg-gray-100 rounded ${className}`} />;
  return <div className={`[&>svg]:w-full [&>svg]:h-full ${className}`} dangerouslySetInnerHTML={{ __html: r.svg }} />;
}

export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <h3 className="text-sm font-semibold mb-3">{title}</h3>
      {children}
    </div>
  );
}

export function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="mt-3 first:mt-0">
      <label className="text-xs text-gray-500 flex justify-between">
        <span>{label}</span>
        <span className="font-mono">{Math.round(value * 100) / 100}</span>
      </label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full"
      />
    </div>
  );
}

export function ColorField({
  label,
  value,
  palette,
  onChange,
}: {
  label: string;
  value: string;
  palette: string[];
  onChange: (hex: string) => void;
}) {
  return (
    <div className="mt-3 first:mt-0">
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-8 h-8 rounded-md border border-gray-300 cursor-pointer"
          aria-label={label}
        />
        <div className="flex gap-1 flex-wrap">
          {palette.map((hex, i) => (
            <button
              key={hex + i}
              onClick={() => onChange(hex)}
              className={`w-6 h-6 rounded-md border hover:scale-110 transition ${
                hex.toLowerCase() === value.toLowerCase() ? 'border-gray-900' : 'border-gray-200'
              }`}
              style={{ backgroundColor: hex }}
              title={hex}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export function Segmented<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${Math.min(options.length, 4)}, minmax(0, 1fr))` }}>
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={`text-xs px-2 py-2 rounded-lg border font-medium transition ${
            value === o.value ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
