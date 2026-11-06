'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useBrandStore } from '@/store';
import type { LogoVariant } from '@/types';
import { LOGO_FONTS, getFont } from '@/lib/logo/fonts';
import { MARK_KINDS } from '@/lib/logo/marks';
import { renderLogo } from '@/lib/logo/render';
import {
  generateOptions,
  makeContext,
  refineOptions,
  type Feedback,
} from '@/lib/logo/generate';
import { generateWithAI, isAIConfigured, type AIGenerationOptions } from '@/lib/logo/ai-generate';
import type {
  Casing,
  ContainerKind,
  LogoColorway,
  LogoDesign,
  LogoLayout,
  MarkKind,
  PartKey,
} from '@/lib/logo/types';
import { ColorField, LogoThumb, Section, Segmented, Slider, useRendered } from './components';

type EditTab = 'symbol' | 'name' | 'color' | 'layout';
type PreviewBg = 'white' | 'gray' | 'dark' | 'brand';
type PartState = 'keep' | 'change' | undefined;
type GenerationMode = 'templates' | 'ai';

interface Session {
  options: LogoDesign[];
  seed: number;
  selected: number;
  working: LogoDesign | null;
  history: LogoDesign[][];
}

const PARTS: { key: PartKey; label: string; hint: string }[] = [
  { key: 'mark', label: 'Symbol', hint: 'The icon or monogram' },
  { key: 'word', label: 'Name & font', hint: 'Typeface, weight, case' },
  { key: 'color', label: 'Colors', hint: 'Palette and contrast' },
  { key: 'layout', label: 'Layout', hint: 'Arrangement and spacing' },
];

const NOTE_EXAMPLES = ['make the symbol bigger', 'rounder and friendlier', 'bolder text, all caps', 'simpler symbol, no container', 'warmer colours'];

const uid = () => `logo_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v));

function download(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function svgToPng(svg: string, w: number, h: number, width: number): Promise<Blob> {
  const height = Math.round((width * h) / w);
  const sized = svg.replace('<svg ', `<svg width="${width}" height="${height}" `);
  const url = URL.createObjectURL(new Blob([sized], { type: 'image/svg+xml;charset=utf-8' }));
  try {
    const img = new Image();
    await new Promise<void>((res, rej) => {
      img.onload = () => res();
      img.onerror = () => rej(new Error('Could not rasterise the logo'));
      img.src = url;
    });
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    canvas.getContext('2d')!.drawImage(img, 0, 0, width, height);
    return await new Promise<Blob>((res, rej) => canvas.toBlob((b) => (b ? res(b) : rej(new Error('PNG failed'))), 'image/png'));
  } finally {
    URL.revokeObjectURL(url);
  }
}

export default function LogoPage() {
  const { currentProject, setLogos } = useBrandStore();
  const projectId = currentProject?.id;

  const ctx = useMemo(
    () => (currentProject ? makeContext(currentProject.brief, currentProject.palette) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentProject?.id, currentProject?.brief, currentProject?.palette]
  );
  const paletteHexes = useMemo(() => {
    const set = new Set<string>(currentProject?.palette.map((s) => s.hex) || []);
    if (ctx) [ctx.palette.primary, ctx.palette.accent, ctx.palette.text, '#111111', '#ffffff'].forEach((h) => set.add(h));
    return Array.from(set);
  }, [currentProject?.palette, ctx]);

  const [session, setSession] = useState<Session | null>(null);
  const [tab, setTab] = useState<EditTab>('symbol');
  const [parts, setParts] = useState<Partial<Record<PartKey, PartState>>>({});
  const [note, setNote] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState<{ understood: string[]; ignored: string[] } | null>(null);
  const [colorway, setColorway] = useState<LogoColorway>('color');
  const [bg, setBg] = useState<PreviewBg>('white');
  const [editingSavedId, setEditingSavedId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState('');

  // AI generation state
  const [genMode, setGenMode] = useState<GenerationMode>('templates');
  const [aiDescription, setAiDescription] = useState('');
  const [aiStyle, setAiStyle] = useState('');
  const [aiColors, setAiColors] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [aiOptions, setAiOptions] = useState<LogoDesign[]>([]);
  const [aiAvailable, setAiAvailable] = useState<boolean | null>(null);

  // Check if AI generation is available
  useEffect(() => {
    isAIConfigured().then(setAiAvailable);
  }, []);

  const storageKey = projectId ? `brando_logo_session_${projectId}` : '';

  // restore or create the first batch of options
  useEffect(() => {
    if (!ctx || !storageKey || session) return;
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as Session;
        if (parsed.options?.length) {
          setSession(parsed);
          return;
        }
      }
    } catch {
      /* ignore broken storage */
    }
    const options = generateOptions(ctx, 0);
    setSession({ options, seed: 0, selected: 0, working: clone(options[0]), history: [] });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ctx, storageKey]);

  useEffect(() => {
    if (!session || !storageKey) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(session));
    } catch {
      /* storage full or blocked: the session just won't survive a reload */
    }
  }, [session, storageKey]);

  const flash = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2600);
  }, []);

  const working = session?.working || null;
  const preview = useRendered(working, colorway, 0.8);
  const logos = currentProject?.logos || [];

  const update = (fn: (d: LogoDesign) => void) => {
    if (!session?.working) return;
    const next = clone(session.working);
    fn(next);
    setSession({ ...session, working: next });
  };

  const choose = (i: number) => {
    if (!session) return;
    setSession({ ...session, selected: i, working: clone(session.options[i]) });
    setEditingSavedId(null);
    setFeedbackMsg(null);
  };

  const moreOptions = () => {
    if (!ctx || !session) return;
    const seed = session.seed + 1;
    const options = generateOptions(ctx, seed);
    setSession({
      options,
      seed,
      selected: 0,
      working: clone(options[0]),
      history: [...session.history, session.options].slice(-8),
    });
    setParts({});
    setFeedbackMsg(null);
  };

  const refine = () => {
    if (!ctx || !session || !session.working) return;
    const fb: Feedback = {
      keep: (Object.keys(parts) as PartKey[]).filter((k) => parts[k] === 'keep'),
      change: (Object.keys(parts) as PartKey[]).filter((k) => parts[k] === 'change'),
      note,
    };
    const seen = session.history.flat();
    const res = refineOptions(session.working, fb, ctx, {
      seed: session.seed + 1,
      avoidMarks: seen.map((d) => d.mark.kind),
      avoidFonts: [],
    });
    setSession({
      options: res.designs,
      seed: session.seed + 1,
      selected: 0,
      working: clone(res.designs[0]),
      history: [...session.history, session.options].slice(-8),
    });
    setFeedbackMsg({ understood: res.understood, ignored: res.ignored });
    flash('Refined options ready');
  };

  const generateAI = async () => {
    if (!aiDescription.trim() || !currentProject) return;
    setAiLoading(true);
    setAiError('');
    
    const options: AIGenerationOptions = {
      description: aiDescription,
      brandName: currentProject.brief.brandName || 'Brand',
      industry: currentProject.brief.industry,
      style: aiStyle || undefined,
      colors: aiColors ? aiColors.split(',').map(c => c.trim()).filter(Boolean) : undefined,
    };
    
    const result = await generateWithAI(options, 4);
    
    if (result.error) {
      setAiError(result.error);
      setAiLoading(false);
      return;
    }
    
    if (result.designs.length > 0) {
      setAiOptions(result.designs);
      // Switch to AI options and select the first one
      setSession({
        options: result.designs,
        seed: session?.seed || 0,
        selected: 0,
        working: clone(result.designs[0]),
        history: session?.history || [],
      });
      setGenMode('templates'); // Switch back to show the options
      flash('AI-generated logos ready');
    } else {
      setAiError('No logos generated. Try a different description.');
    }
    
    setAiLoading(false);
  };

  const back = () => {
    if (!session || session.history.length === 0) return;
    const prev = session.history[session.history.length - 1];
    setSession({
      ...session,
      options: prev,
      selected: 0,
      working: clone(prev[0]),
      history: session.history.slice(0, -1),
    });
    setFeedbackMsg(null);
  };

  const togglePart = (key: PartKey, state: PartState) =>
    setParts((p) => ({ ...p, [key]: p[key] === state ? undefined : state }));

  // ---- saving ---------------------------------------------------------
  const saveLogo = async (asNew: boolean) => {
    if (!working) return;
    setBusy(true);
    try {
      const r = await renderLogo(working, { colorway: 'color' });
      let next: LogoVariant[];
      if (!asNew && editingSavedId) {
        next = logos.map((l) => (l.id === editingSavedId ? { ...l, svg: r.svg, design: clone(working), name: working.concept } : l));
        flash('Logo updated');
      } else {
        const entry: LogoVariant = {
          id: uid(),
          name: working.concept,
          svg: r.svg,
          design: clone(working),
          isPrimary: logos.length === 0,
        };
        next = [...logos, entry];
        setEditingSavedId(entry.id);
        flash(logos.length === 0 ? 'Saved as your primary logo' : 'Saved to your logos');
      }
      await setLogos(next);
    } finally {
      setBusy(false);
    }
  };

  const setPrimary = (id: string) => setLogos(logos.map((l) => ({ ...l, isPrimary: l.id === id })));
  const deleteLogo = (id: string) => {
    const wasPrimary = logos.find((l) => l.id === id)?.isPrimary;
    const next = logos.filter((l) => l.id !== id);
    if (wasPrimary && next.length) next[0] = { ...next[0], isPrimary: true };
    if (editingSavedId === id) setEditingSavedId(null);
    setLogos(next);
  };
  const openSaved = (l: LogoVariant) => {
    if (!l.design || !session) return;
    setSession({ ...session, working: clone(l.design) });
    setEditingSavedId(l.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ---- exporting ------------------------------------------------------
  const exportAs = async (format: 'svg' | 'png', way: LogoColorway, width = 2048) => {
    if (!working) return;
    setBusy(true);
    try {
      const r = await renderLogo(working, { colorway: way, padding: 0.4 });
      const base = `${(working.word.text || 'logo').replace(/\s+/g, '-').toLowerCase()}-${way === 'color' ? 'color' : way === 'dark' ? 'black' : 'white'}`;
      if (format === 'svg') download(new Blob([r.svg], { type: 'image/svg+xml' }), `${base}.svg`);
      else download(await svgToPng(r.svg, r.width, r.height, width), `${base}-${width}.png`);
    } catch (e) {
      flash(e instanceof Error ? e.message : 'Export failed');
    } finally {
      setBusy(false);
    }
  };

  const exportKit = async () => {
    for (const way of ['color', 'dark', 'light'] as LogoColorway[]) {
      await exportAs('svg', way);
      await exportAs('png', way, 2048);
    }
    flash('Downloaded SVG + PNG in color, black and white');
  };

  if (!currentProject || !ctx || !session || !working) {
    return <div className="text-gray-500">Loading...</div>;
  }

  const bgStyle: Record<PreviewBg, string> = {
    white: '#ffffff',
    gray: '#f1f1f3',
    dark: '#111113',
    brand: ctx.palette.primary,
  };
  const font = getFont(working.word.fontId);
  const fontOk = preview ? preview.missing.length === 0 : true;
  const hasFeedback = !!note.trim() || Object.values(parts).some(Boolean);

  return (
    <div className="max-w-6xl">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Logo Studio</h1>
          <p className="text-gray-600">
            Describe your vision or explore templates, then fine-tune every detail.
          </p>
        </div>
        {toast && <div className="text-sm px-3 py-1.5 rounded-lg bg-gray-900 text-white">{toast}</div>}
      </div>

      {/* AI Generation Section */}
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl border border-purple-200 p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-sm font-bold">AI</div>
          <h2 className="text-lg font-semibold">Describe Your Logo</h2>
          <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 ml-2">Beta</span>
        </div>
        
        {genMode === 'ai' ? (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">What should your logo represent?</label>
              <textarea
                value={aiDescription}
                onChange={(e) => setAiDescription(e.target.value)}
                rows={3}
                placeholder="e.g., A modern mountain peak with a sunrise, representing adventure and new beginnings. Clean and minimalist style."
                className="w-full px-4 py-3 rounded-lg border border-gray-300 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none resize-none"
              />
            </div>
            
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Style (optional)</label>
                <select
                  value={aiStyle}
                  onChange={(e) => setAiStyle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm"
                >
                  <option value="">Any style</option>
                  <option value="modern">Modern</option>
                  <option value="minimal">Minimal</option>
                  <option value="bold">Bold</option>
                  <option value="elegant">Elegant</option>
                  <option value="playful">Playful</option>
                  <option value="tech">Tech/Digital</option>
                  <option value="organic">Organic/Natural</option>
                </select>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Colors (optional)</label>
                <input
                  type="text"
                  value={aiColors}
                  onChange={(e) => setAiColors(e.target.value)}
                  placeholder="e.g., blue, gold"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm"
                />
              </div>
            </div>
            
            {aiError && (
              <div className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-3">{aiError}</div>
            )}
            
            <div className="flex gap-3">
              <button
                onClick={generateAI}
                disabled={aiLoading || !aiDescription.trim()}
                className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {aiLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    Generating... (1-2 min)
                  </>
                ) : (
                  <>
                    <span>✨</span>
                    Generate with AI
                  </>
                )}
              </button>
              <button
                onClick={() => setGenMode('templates')}
                className="px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium"
              >
                Back to templates
              </button>
            </div>
            
            {aiLoading && (
              <div className="flex items-center gap-2 text-sm text-purple-700 bg-purple-50 rounded-lg px-4 py-3">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                AI is creating unique logos for you. This takes about 1-2 minutes...
              </div>
            )}
            
            <p className="text-xs text-gray-500">
              {aiAvailable 
                ? 'AI will generate unique logo concepts based on your description.'
                : '⚠️ AI generation requires an API key. Add QWEN_API_KEY to your .env.local file to enable this feature.'}
            </p>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Can&apos;t find what you&apos;re looking for? Describe your perfect logo and let AI create it for you.
            </p>
            <button
              onClick={() => setGenMode('ai')}
              disabled={aiAvailable === false}
              className="px-4 py-2 rounded-lg bg-white border border-purple-300 text-purple-700 hover:bg-purple-50 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ✨ Try AI Generation
            </button>
          </div>
        )}
      </div>

      {/* 1. Options */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <h2 className="text-lg font-semibold">
            Options <span className="text-sm font-normal text-gray-500">· round {session.history.length + 1}</span>
          </h2>
          <div className="flex gap-2">
            <button
              onClick={back}
              disabled={session.history.length === 0}
              className="text-sm px-3 py-1.5 rounded-md border border-gray-200 hover:bg-gray-50 disabled:opacity-40"
            >
              ← Previous round
            </button>
            <button onClick={moreOptions} className="text-sm px-3 py-1.5 rounded-md border border-gray-200 hover:bg-gray-50">
              New directions
            </button>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {session.options.map((d, i) => (
            <button
              key={i}
              onClick={() => choose(i)}
              className={`rounded-lg border-2 p-4 text-left transition ${
                session.selected === i ? 'border-brand-600 bg-brand-50' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <LogoThumb design={d} className="w-full h-28 flex items-center justify-center" />
              <div className="text-xs text-gray-500 mt-2 text-center truncate">{d.concept}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* 2. Preview */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <h2 className="text-lg font-semibold">Preview</h2>
              <div className="flex flex-wrap gap-2 items-center">
                <div className="flex gap-1">
                  {(['white', 'gray', 'dark', 'brand'] as PreviewBg[]).map((b) => (
                    <button
                      key={b}
                      onClick={() => setBg(b)}
                      title={b}
                      className={`w-6 h-6 rounded-full border-2 ${bg === b ? 'border-gray-900' : 'border-gray-200'}`}
                      style={{ backgroundColor: bgStyle[b] }}
                    />
                  ))}
                </div>
                <select
                  value={colorway}
                  onChange={(e) => setColorway(e.target.value as LogoColorway)}
                  className="text-sm px-2 py-1.5 rounded-md border border-gray-200"
                >
                  <option value="color">Full color</option>
                  <option value="dark">Black</option>
                  <option value="light">White</option>
                </select>
              </div>
            </div>
            <div
              className="w-full rounded-lg flex items-center justify-center min-h-[260px] p-6 transition-colors"
              style={{ backgroundColor: bgStyle[bg] }}
            >
              {preview ? (
                <div className="w-full max-w-md [&>svg]:w-full [&>svg]:h-auto" dangerouslySetInnerHTML={{ __html: preview.svg }} />
              ) : (
                <div className="text-sm text-gray-400">Rendering…</div>
              )}
            </div>
            {!fontOk && preview && (
              <p className="text-xs text-amber-700 bg-amber-50 rounded-md px-3 py-2 mt-3">
                {font.name} can’t draw: {preview.missing.join(' ')} — pick another font (Inter, Montserrat, Manrope, Raleway,
                Unbounded, Oswald and Lora support Mongolian).
              </p>
            )}
            <div className="flex flex-wrap gap-2 mt-4">
              <button
                onClick={() => saveLogo(true)}
                disabled={busy}
                className="text-sm px-4 py-2 rounded-lg bg-gray-900 text-white hover:bg-gray-800 font-medium disabled:opacity-50"
              >
                Save to my logos
              </button>
              {editingSavedId && (
                <button
                  onClick={() => saveLogo(false)}
                  disabled={busy}
                  className="text-sm px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 font-medium disabled:opacity-50"
                >
                  Update saved logo
                </button>
              )}
              <div className="flex-1" />
              <button onClick={() => exportAs('svg', colorway)} disabled={busy} className="text-sm px-3 py-2 rounded-md border border-gray-200 hover:bg-gray-50">
                SVG
              </button>
              <button onClick={() => exportAs('png', colorway, 2048)} disabled={busy} className="text-sm px-3 py-2 rounded-md border border-gray-200 hover:bg-gray-50">
                PNG
              </button>
              <button onClick={exportKit} disabled={busy} className="text-sm px-3 py-2 rounded-md border border-gray-200 hover:bg-gray-50">
                Full kit
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Exports are pure vector outlines — no fonts needed — with a transparent background. “Full kit” downloads SVG and PNG in
              color, black and white.
            </p>
          </div>

          {/* 3. Feedback */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-1">Tell us what to change</h2>
            <p className="text-sm text-gray-600 mb-4">
              Mark what you like to keep, what you want changed, and say anything else. We’ll show new options built on this one.
            </p>
            <div className="grid sm:grid-cols-2 gap-3 mb-4">
              {PARTS.map((p) => (
                <div key={p.key} className="flex items-center justify-between gap-2 rounded-lg border border-gray-200 px-3 py-2">
                  <div>
                    <div className="text-sm font-medium">{p.label}</div>
                    <div className="text-xs text-gray-500">{p.hint}</div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => togglePart(p.key, 'keep')}
                      className={`text-xs px-2.5 py-1.5 rounded-md border ${
                        parts[p.key] === 'keep' ? 'bg-green-600 border-green-600 text-white' : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      Keep
                    </button>
                    <button
                      onClick={() => togglePart(p.key, 'change')}
                      className={`text-xs px-2.5 py-1.5 rounded-md border ${
                        parts[p.key] === 'change' ? 'bg-gray-900 border-gray-900 text-white' : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      Change
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              placeholder="e.g. I like the symbol but the text feels too thin. Make it bolder and use warmer colours."
              className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:border-brand-600 outline-none"
            />
            <div className="flex flex-wrap gap-1.5 mt-2">
              {NOTE_EXAMPLES.map((ex) => (
                <button
                  key={ex}
                  onClick={() => setNote((n) => (n.trim() ? `${n.trim()}, ${ex}` : ex))}
                  className="text-xs px-2 py-1 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600"
                >
                  + {ex}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3 mt-4">
              <button
                onClick={refine}
                disabled={!hasFeedback}
                className="text-sm px-4 py-2 rounded-lg bg-gray-900 text-white hover:bg-gray-800 font-medium disabled:opacity-40"
              >
                Show refined options
              </button>
              {!hasFeedback && <span className="text-xs text-gray-500">Mark a part or write a note first.</span>}
            </div>
            {feedbackMsg && (
              <div className="mt-4 text-sm rounded-lg bg-gray-50 border border-gray-200 p-3 space-y-1">
                {feedbackMsg.understood.length > 0 && (
                  <p>
                    <span className="font-medium">Applied:</span> {feedbackMsg.understood.join(', ')}.
                  </p>
                )}
                {feedbackMsg.ignored.length > 0 && (
                  <p className="text-amber-700">
                    Couldn’t interpret: “{feedbackMsg.ignored.join('”, “')}”. Try the Keep/Change buttons or the editor on the right.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* 4. Saved */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4">My logos</h2>
            {logos.length === 0 ? (
              <p className="text-sm text-gray-500">Nothing saved yet. Choose an option and press “Save to my logos”.</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {logos.map((logo) => (
                  <div
                    key={logo.id}
                    className={`relative rounded-lg border-2 p-4 ${editingSavedId === logo.id ? 'border-brand-600 bg-brand-50' : 'border-gray-200'}`}
                  >
                    {logo.isPrimary && (
                      <span className="absolute top-2 right-2 text-xs px-2 py-0.5 bg-brand-600 text-white rounded-full">Primary</span>
                    )}
                    <div className="w-full h-20 flex items-center justify-center [&>svg]:max-h-full [&>svg]:max-w-full" dangerouslySetInnerHTML={{ __html: logo.svg }} />
                    <div className="text-xs text-gray-500 mt-2 text-center truncate">{logo.name}</div>
                    <div className="flex gap-1 mt-2">
                      {logo.design && (
                        <button onClick={() => openSaved(logo)} className="flex-1 text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200">
                          Edit
                        </button>
                      )}
                      {!logo.isPrimary && (
                        <button onClick={() => setPrimary(logo.id)} className="flex-1 text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200">
                          Set primary
                        </button>
                      )}
                      <button
                        onClick={() => deleteLogo(logo.id)}
                        className="text-xs px-2 py-1 rounded bg-red-50 text-red-600 hover:bg-red-100"
                        aria-label="Delete logo"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Editor */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-2 grid grid-cols-4 gap-1">
            {(['symbol', 'name', 'color', 'layout'] as EditTab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`text-xs py-2 rounded-lg font-medium capitalize ${tab === t ? 'bg-gray-900 text-white' : 'hover:bg-gray-100 text-gray-600'}`}
              >
                {t}
              </button>
            ))}
          </div>

          {tab === 'symbol' && (
            <>
              <Section title="Symbol">
                <div className="grid grid-cols-3 gap-1.5">
                  {[{ kind: 'none' as MarkKind, label: 'None' }, ...MARK_KINDS].map((m) => (
                    <button
                      key={m.kind}
                      onClick={() =>
                        update((d) => {
                          d.mark.kind = m.kind;
                          if (m.kind === 'none') d.layout = 'word';
                          else if (d.layout === 'word') d.layout = 'horizontal';
                        })
                      }
                      className={`text-xs px-2 py-2 rounded-lg border ${
                        working.mark.kind === m.kind ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </Section>
              {working.mark.kind !== 'none' && (
                <Section title="Shape">
                  <div className="text-xs text-gray-500 mb-1">Container</div>
                  <select
                    value={working.mark.container}
                    onChange={(e) => update((d) => (d.mark.container = e.target.value as ContainerKind))}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm mb-3"
                  >
                    {(['none', 'circle', 'square', 'rounded', 'hex', 'shield'] as ContainerKind[]).map((c) => (
                      <option key={c} value={c}>
                        {c === 'none' ? 'No container' : c[0].toUpperCase() + c.slice(1)}
                      </option>
                    ))}
                  </select>
                  <Segmented
                    value={working.mark.style}
                    options={[
                      { value: 'solid', label: 'Solid' },
                      { value: 'outline', label: 'Outline' },
                    ]}
                    onChange={(v) => update((d) => (d.mark.style = v))}
                  />
                  {working.mark.kind !== 'monogram' && (
                    <Slider label="Repeats / variation" value={working.mark.count} min={1} max={12} onChange={(v) => update((d) => (d.mark.count = v))} />
                  )}
                  <Slider label="Rotation" value={working.mark.rotation} min={0} max={360} onChange={(v) => update((d) => (d.mark.rotation = v))} />
                  <Slider label="Roundness" value={working.mark.rounding} min={0} max={1} step={0.05} onChange={(v) => update((d) => (d.mark.rounding = v))} />
                  <Slider label="Stroke weight" value={working.mark.thickness} min={0.5} max={1.6} step={0.05} onChange={(v) => update((d) => (d.mark.thickness = v))} />
                  <Slider label="Size" value={working.mark.scale} min={0.6} max={1.6} step={0.05} onChange={(v) => update((d) => (d.mark.scale = v))} />
                </Section>
              )}
            </>
          )}

          {tab === 'name' && (
            <>
              <Section title="Name">
                <input
                  type="text"
                  value={working.word.text}
                  onChange={(e) => update((d) => (d.word.text = e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:border-brand-600 outline-none"
                  placeholder="Brand name"
                />
                <div className="text-xs text-gray-500 mt-3 mb-1">Typeface</div>
                <select
                  value={working.word.fontId}
                  onChange={(e) =>
                    update((d) => {
                      d.word.fontId = e.target.value;
                      const w = getFont(e.target.value).weights;
                      if (!w.includes(d.word.weight)) d.word.weight = w[w.length - 1];
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm"
                >
                  {LOGO_FONTS.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                      {f.mongolian ? ' · Mongolian ✓' : f.cyrillic ? ' · Cyrillic (no Ү Ө)' : ' · Latin only'}
                    </option>
                  ))}
                </select>
                <div className="mt-3">
                  <Segmented
                    value={String(working.word.weight) as '400' | '700'}
                    options={font.weights.map((w) => ({ value: String(w) as '400' | '700', label: w === 400 ? 'Regular' : 'Bold' }))}
                    onChange={(v) => update((d) => (d.word.weight = Number(v) as 400 | 700))}
                  />
                </div>
                <div className="mt-3">
                  <Segmented<Casing>
                    value={working.word.casing}
                    options={[
                      { value: 'upper', label: 'ABC' },
                      { value: 'title', label: 'Abc' },
                      { value: 'lower', label: 'abc' },
                      { value: 'asis', label: 'As typed' },
                    ]}
                    onChange={(v) => update((d) => (d.word.casing = v))}
                  />
                </div>
                <Slider label="Letter spacing" value={working.word.tracking} min={-20} max={400} step={5} onChange={(v) => update((d) => (d.word.tracking = v))} />
              </Section>
              <Section title="Tagline">
                <label className="flex items-center gap-2 text-sm mb-2">
                  <input type="checkbox" checked={working.tagline.show} onChange={(e) => update((d) => (d.tagline.show = e.target.checked))} />
                  Show tagline
                </label>
                <input
                  type="text"
                  value={working.tagline.text}
                  onChange={(e) => update((d) => (d.tagline.text = e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:border-brand-600 outline-none"
                  placeholder="Tagline"
                />
              </Section>
            </>
          )}

          {tab === 'color' && (
            <Section title="Colors">
              <ColorField label="Symbol" value={working.mark.color} palette={paletteHexes} onChange={(h) => update((d) => (d.mark.color = h))} />
              <ColorField label="Symbol accent" value={working.mark.accent} palette={paletteHexes} onChange={(h) => update((d) => (d.mark.accent = h))} />
              <ColorField label="Name" value={working.word.color} palette={paletteHexes} onChange={(h) => update((d) => (d.word.color = h))} />
              <ColorField label="Tagline" value={working.tagline.color} palette={paletteHexes} onChange={(h) => update((d) => (d.tagline.color = h))} />
              <button
                onClick={() => update((d) => ((d.mark.accent = d.mark.color), (d.word.color = d.mark.color)))}
                className="mt-4 text-xs px-3 py-1.5 rounded-md border border-gray-200 hover:bg-gray-50"
              >
                Use one color everywhere
              </button>
            </Section>
          )}

          {tab === 'layout' && (
            <Section title="Layout">
              <Segmented<LogoLayout>
                value={working.layout}
                options={[
                  { value: 'horizontal', label: 'Side' },
                  { value: 'stacked', label: 'Stacked' },
                  { value: 'mark', label: 'Symbol' },
                  { value: 'word', label: 'Name' },
                ]}
                onChange={(v) => update((d) => (d.layout = v))}
              />
              <Slider label="Space between symbol and name" value={working.gap} min={0.2} max={1.6} step={0.05} onChange={(v) => update((d) => (d.gap = v))} />
              <Slider label="Symbol size" value={working.mark.scale} min={0.6} max={1.6} step={0.05} onChange={(v) => update((d) => (d.mark.scale = v))} />
            </Section>
          )}
        </div>
      </div>
    </div>
  );
}
