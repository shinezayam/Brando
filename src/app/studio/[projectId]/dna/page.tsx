'use client';

import { useState } from 'react';
import { useBrandStore } from '@/store';
import type { BrandDNA } from '@/types';
import { generateBrandDNA } from '@/lib/dna-generator';

type EditableSection = keyof BrandDNA;

export default function DNAPage() {
  const { currentProject, setDNA } = useBrandStore();
  const [dna, setLocalDNA] = useState<BrandDNA | null>(currentProject?.dna || null);
  const [editingSection, setEditingSection] = useState<EditableSection | null>(null);
  const [editValue, setEditValue] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  if (!currentProject) {
    return <div className="text-gray-500">Loading...</div>;
  }

  const handleGenerate = () => {
    setIsGenerating(true);
    // Simulate API delay
    setTimeout(() => {
      const generated = generateBrandDNA(currentProject.brief);
      setLocalDNA(generated);
      setDNA(generated);
      setIsGenerating(false);
    }, 800);
  };

  const handleRegenerateSection = (section: EditableSection) => {
    if (!currentProject.brief) return;
    // For simplicity, regenerate the entire DNA and update just the section
    // In production, you'd call an API endpoint for per-section regeneration
    const fresh = generateBrandDNA(currentProject.brief);
    const updated = { ...dna!, [section]: fresh[section] };
    setLocalDNA(updated);
    setDNA(updated);
  };

  const startEdit = (section: EditableSection, value: string | string[]) => {
    setEditingSection(section);
    setEditValue(Array.isArray(value) ? value.join('\n') : value);
  };

  const saveEdit = () => {
    if (!editingSection || !dna) return;
    const isList = Array.isArray(dna[editingSection]);
    const newValue = isList
      ? editValue.split('\n').map((s) => s.trim()).filter(Boolean)
      : editValue;
    const updated = { ...dna, [editingSection]: newValue };
    setLocalDNA(updated);
    setDNA(updated);
    setEditingSection(null);
    setEditValue('');
  };

  const cancelEdit = () => {
    setEditingSection(null);
    setEditValue('');
  };

  // No DNA yet — show generate button
  if (!dna) {
    return (
      <div className="max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Brand DNA</h1>
          <p className="text-gray-600">Your brand&apos;s strategy, voice, and messaging</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="text-6xl mb-4">💎</div>
          <h2 className="text-xl font-semibold mb-2">Generate Brand DNA</h2>
          <p className="text-sm text-gray-600 max-w-md mx-auto mb-6">
            Based on your brief, we&apos;ll generate your brand&apos;s mission, vision, values,
            voice traits, and messaging pillars. Everything is editable afterward.
          </p>
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="px-6 py-3 rounded-lg bg-gray-900 text-white hover:bg-gray-800 font-medium transition disabled:opacity-50"
          >
            {isGenerating ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Generating...
              </span>
            ) : (
              '✨ Generate Brand DNA'
            )}
          </button>
          <p className="text-xs text-gray-400 mt-4">
            Uses deterministic generation. Connect Qwen API for AI-powered output.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Brand DNA</h1>
          <p className="text-gray-600">Your brand&apos;s strategy, voice, and messaging</p>
        </div>
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="text-sm px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition disabled:opacity-50"
        >
          🔄 Regenerate All
        </button>
      </div>

      {/* Brand Essence */}
      <DNACard
        title="Brand Essence"
        content={dna.essence}
        onEdit={() => startEdit('essence', dna.essence)}
        onRegenerate={() => handleRegenerateSection('essence')}
        isEditing={editingSection === 'essence'}
        editValue={editValue}
        setEditValue={setEditValue}
        onSave={saveEdit}
        onCancel={cancelEdit}
      />

      {/* Positioning */}
      <DNACard
        title="Positioning Statement"
        content={dna.positioning}
        onEdit={() => startEdit('positioning', dna.positioning)}
        onRegenerate={() => handleRegenerateSection('positioning')}
        isEditing={editingSection === 'positioning'}
        editValue={editValue}
        setEditValue={setEditValue}
        onSave={saveEdit}
        onCancel={cancelEdit}
      />

      {/* Brand Story */}
      <DNACard
        title="Brand Story"
        content={dna.story}
        onEdit={() => startEdit('story', dna.story)}
        onRegenerate={() => handleRegenerateSection('story')}
        isEditing={editingSection === 'story'}
        editValue={editValue}
        setEditValue={setEditValue}
        onSave={saveEdit}
        onCancel={cancelEdit}
      />

      {/* Mission & Vision */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <DNACard
          title="Mission"
          content={dna.mission}
          onEdit={() => startEdit('mission', dna.mission)}
          onRegenerate={() => handleRegenerateSection('mission')}
          isEditing={editingSection === 'mission'}
          editValue={editValue}
          setEditValue={setEditValue}
          onSave={saveEdit}
          onCancel={cancelEdit}
        />
        <DNACard
          title="Vision"
          content={dna.vision}
          onEdit={() => startEdit('vision', dna.vision)}
          onRegenerate={() => handleRegenerateSection('vision')}
          isEditing={editingSection === 'vision'}
          editValue={editValue}
          setEditValue={setEditValue}
          onSave={saveEdit}
          onCancel={cancelEdit}
        />
      </div>

      {/* Values */}
      <DNACardList
        title="Core Values"
        items={dna.values}
        onEdit={() => startEdit('values', dna.values)}
        onRegenerate={() => handleRegenerateSection('values')}
        isEditing={editingSection === 'values'}
        editValue={editValue}
        setEditValue={setEditValue}
        onSave={saveEdit}
        onCancel={cancelEdit}
      />

      {/* Voice & Tone */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <DNACardList
          title="Voice Traits"
          items={dna.voiceTraits}
          onEdit={() => startEdit('voiceTraits', dna.voiceTraits)}
          onRegenerate={() => handleRegenerateSection('voiceTraits')}
          isEditing={editingSection === 'voiceTraits'}
          editValue={editValue}
          setEditValue={setEditValue}
          onSave={saveEdit}
          onCancel={cancelEdit}
        />
        <DNACardList
          title="Differentiators"
          items={dna.differentiators}
          onEdit={() => startEdit('differentiators', dna.differentiators)}
          onRegenerate={() => handleRegenerateSection('differentiators')}
          isEditing={editingSection === 'differentiators'}
          editValue={editValue}
          setEditValue={setEditValue}
          onSave={saveEdit}
          onCancel={cancelEdit}
        />
      </div>

      {/* Messaging Pillars */}
      <DNACardList
        title="Messaging Pillars"
        items={dna.messagingPillars}
        onEdit={() => startEdit('messagingPillars', dna.messagingPillars)}
        onRegenerate={() => handleRegenerateSection('messagingPillars')}
        isEditing={editingSection === 'messagingPillars'}
        editValue={editValue}
        setEditValue={setEditValue}
        onSave={saveEdit}
        onCancel={cancelEdit}
      />

      {/* Tagline Options */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Tagline Options</h2>
          <button
            onClick={() => handleRegenerateSection('taglineOptions')}
            className="text-xs px-2 py-1 rounded-md border border-gray-200 hover:bg-gray-50"
          >
            🔄 Regenerate
          </button>
        </div>
        {editingSection === 'taglineOptions' ? (
          <div className="space-y-2">
            <textarea
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              rows={5}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:border-brand-600 outline-none resize-none"
              placeholder="One tagline per line"
            />
            <div className="flex gap-2">
              <button onClick={saveEdit} className="text-xs px-3 py-1.5 rounded-md bg-gray-900 text-white">
                Save
              </button>
              <button onClick={cancelEdit} className="text-xs px-3 py-1.5 rounded-md border border-gray-200">
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {dna.taglineOptions.map((tagline, i) => (
              <div
                key={i}
                className="p-3 bg-gray-50 rounded-lg text-sm font-medium text-gray-700"
              >
                &ldquo;{tagline}&rdquo;
              </div>
            ))}
            <button
              onClick={() => startEdit('taglineOptions', dna.taglineOptions)}
              className="text-xs text-gray-500 hover:text-gray-700 mt-2"
            >
              ✏️ Edit taglines
            </button>
          </div>
        )}
      </div>

      {/* Audience Summary */}
      <DNACard
        title="Audience Summary"
        content={dna.audienceSummary}
        onEdit={() => startEdit('audienceSummary', dna.audienceSummary)}
        onRegenerate={() => handleRegenerateSection('audienceSummary')}
        isEditing={editingSection === 'audienceSummary'}
        editValue={editValue}
        setEditValue={setEditValue}
        onSave={saveEdit}
        onCancel={cancelEdit}
      />
    </div>
  );
}

// Reusable card for text sections
function DNACard({
  title,
  content,
  onEdit,
  onRegenerate,
  isEditing,
  editValue,
  setEditValue,
  onSave,
  onCancel,
}: {
  title: string;
  content: string;
  onEdit: () => void;
  onRegenerate: () => void;
  isEditing: boolean;
  editValue: string;
  setEditValue: (v: string) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">{title}</h2>
        <div className="flex gap-2">
          <button
            onClick={onRegenerate}
            className="text-xs px-2 py-1 rounded-md border border-gray-200 hover:bg-gray-50"
          >
            🔄
          </button>
        </div>
      </div>
      {isEditing ? (
        <div className="space-y-2">
          <textarea
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:border-brand-600 outline-none resize-none"
          />
          <div className="flex gap-2">
            <button onClick={onSave} className="text-xs px-3 py-1.5 rounded-md bg-gray-900 text-white">
              Save
            </button>
            <button onClick={onCancel} className="text-xs px-3 py-1.5 rounded-md border border-gray-200">
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div>
          <p className="text-gray-700 leading-relaxed">{content}</p>
          <button
            onClick={onEdit}
            className="text-xs text-gray-500 hover:text-gray-700 mt-2"
          >
            ✏️ Edit
          </button>
        </div>
      )}
    </div>
  );
}

// Reusable card for list sections
function DNACardList({
  title,
  items,
  onEdit,
  onRegenerate,
  isEditing,
  editValue,
  setEditValue,
  onSave,
  onCancel,
}: {
  title: string;
  items: string[];
  onEdit: () => void;
  onRegenerate: () => void;
  isEditing: boolean;
  editValue: string;
  setEditValue: (v: string) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">{title}</h2>
        <button
          onClick={onRegenerate}
          className="text-xs px-2 py-1 rounded-md border border-gray-200 hover:bg-gray-50"
        >
          🔄
        </button>
      </div>
      {isEditing ? (
        <div className="space-y-2">
          <textarea
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            rows={items.length + 2}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:border-brand-600 outline-none resize-none"
            placeholder="One item per line"
          />
          <div className="flex gap-2">
            <button onClick={onSave} className="text-xs px-3 py-1.5 rounded-md bg-gray-900 text-white">
              Save
            </button>
            <button onClick={onCancel} className="text-xs px-3 py-1.5 rounded-md border border-gray-200">
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div>
          <ul className="space-y-2">
            {items.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="text-brand-600 mt-0.5">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <button
            onClick={onEdit}
            className="text-xs text-gray-500 hover:text-gray-700 mt-2"
          >
            ✏️ Edit
          </button>
        </div>
      )}
    </div>
  );
}
