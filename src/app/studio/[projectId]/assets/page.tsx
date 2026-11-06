'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useBrandStore } from '@/store';
import type { BrandAsset } from '@/types';
import {
  getProjectAssets,
  addAsset,
  updateAsset,
  deleteAsset,
  duplicateAsset,
} from '@/lib/assets-db';

type AssetWithBlob = BrandAsset & { projectId?: string; dataUrl?: string };
type AssetType = BrandAsset['type'];
type CategoryFilter = 'all' | AssetType;

const CATEGORIES: { key: CategoryFilter; label: string; icon: string }[] = [
  { key: 'all', label: 'All', icon: '📁' },
  { key: 'logo', label: 'Logos', icon: '🎨' },
  { key: 'image', label: 'Images', icon: '🖼️' },
  { key: 'typography', label: 'Typography', icon: '🔤' },
  { key: 'color', label: 'Colors', icon: '🎨' },
  { key: 'mockup', label: 'Mockups', icon: '📐' },
  { key: 'document', label: 'Documents', icon: '📄' },
];

const ACCEPTED_TYPES = ['image/svg+xml', 'image/png', 'image/jpeg', 'image/webp'];
const MAX_SIZE = 10 * 1024 * 1024;

function assetId(): string {
  return `asset_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function inferType(file: File): AssetType {
  if (file.type === 'image/svg+xml') return 'logo';
  return 'image';
}

function svgToDataUrl(svg: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export default function AssetsPage() {
  const { currentProject, setLogos } = useBrandStore();
  const [assets, setAssets] = useState<AssetWithBlob[]>([]);
  const [category, setCategory] = useState<CategoryFilter>('all');
  const [search, setSearch] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [tagInput, setTagInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const projectId = currentProject?.id;
  const savedLogos = currentProject?.logos || [];

  const loadAssets = useCallback(async () => {
    if (!projectId) return;
    const result = await getProjectAssets(projectId);
    setAssets(result);
  }, [projectId]);

  useEffect(() => {
    loadAssets();
  }, [loadAssets]);

  const handleUpload = async (files: FileList | File[]) => {
    if (!projectId) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        if (!ACCEPTED_TYPES.includes(file.type)) continue;
        if (file.size > MAX_SIZE) {
          alert(`${file.name} is too large (max 10MB)`);
          continue;
        }
        const dataUrl = await fileToDataUrl(file);
        const asset: BrandAsset = {
          id: assetId(),
          name: file.name.replace(/\.[^.]+$/, ''),
          type: inferType(file),
          url: dataUrl,
          tags: [],
          favorite: false,
          createdAt: new Date().toISOString(),
        };
        await addAsset(projectId, asset, dataUrl);
      }
      await loadAssets();
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      handleUpload(e.dataTransfer.files);
    }
  };

  const handleToggleFavorite = async (id: string) => {
    const asset = assets.find((a) => a.id === id);
    if (!asset) return;
    await updateAsset(id, { favorite: !asset.favorite });
    await loadAssets();
  };

  const handleDelete = async (id: string) => {
    await deleteAsset(id);
    if (selectedId === id) setSelectedId(null);
    await loadAssets();
  };

  const handleDuplicate = async (id: string) => {
    if (!projectId) return;
    await duplicateAsset(id);
    await loadAssets();
  };

  const handleRename = async (id: string) => {
    if (!renameValue.trim()) return;
    await updateAsset(id, { name: renameValue.trim() });
    setRenamingId(null);
    await loadAssets();
  };

  const handleAddTag = async (id: string) => {
    if (!tagInput.trim()) return;
    const asset = assets.find((a) => a.id === id);
    if (!asset) return;
    const newTags = [...asset.tags, tagInput.trim()];
    await updateAsset(id, { tags: newTags });
    setTagInput('');
    await loadAssets();
  };

  const handleRemoveTag = async (id: string, tag: string) => {
    const asset = assets.find((a) => a.id === id);
    if (!asset) return;
    await updateAsset(id, { tags: asset.tags.filter((t) => t !== tag) });
    await loadAssets();
  };

  const handleDownload = (asset: AssetWithBlob) => {
    const a = document.createElement('a');
    a.href = asset.dataUrl || asset.url;
    const ext = asset.type === 'logo' ? 'svg' : 'png';
    a.download = `${asset.name}.${ext}`;
    a.click();
  };

  const filtered = assets.filter((a) => {
    if (category !== 'all' && a.type !== category) return false;
    if (showFavoritesOnly && !a.favorite) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        a.name.toLowerCase().includes(q) ||
        a.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const showLogosSection = savedLogos.length > 0 && (category === 'all' || category === 'logo');

  const handleDownloadLogo = (logo: typeof savedLogos[0]) => {
    const blob = new Blob([logo.svg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${logo.name.replace(/\s+/g, '-').toLowerCase()}.svg`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const handleDeleteLogo = (logoId: string) => {
    const wasPrimary = savedLogos.find((l) => l.id === logoId)?.isPrimary;
    const next = savedLogos.filter((l) => l.id !== logoId);
    if (wasPrimary && next.length) next[0] = { ...next[0], isPrimary: true };
    setLogos(next);
    if (selectedId === `logo_${logoId}`) setSelectedId(null);
  };

  const handleSetPrimaryLogo = (logoId: string) => {
    setLogos(savedLogos.map((l) => ({ ...l, isPrimary: l.id === logoId })));
  };

  const selectedAsset = assets.find((a) => a.id === selectedId);
  const selectedLogo = selectedId?.startsWith('logo_') ? savedLogos.find((l) => `logo_${l.id}` === selectedId) : null;

  if (!currentProject) {
    return <div className="text-gray-500">Loading...</div>;
  }

  return (
    <div className="max-w-6xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Brand Assets</h1>
          <p className="text-gray-600">Upload, organize, and manage your brand files</p>
        </div>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="px-4 py-2 rounded-lg bg-gray-900 text-white hover:bg-gray-800 font-medium text-sm disabled:opacity-50 transition"
        >
          {uploading ? 'Uploading...' : '+ Upload'}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(',')}
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) handleUpload(e.target.files);
            e.target.value = '';
          }}
        />
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`mb-6 rounded-xl border-2 border-dashed p-8 text-center transition ${
          dragOver
            ? 'border-brand-600 bg-brand-50'
            : 'border-gray-200 hover:border-gray-300'
        }`}
      >
        <div className="text-4xl mb-2">📦</div>
        <p className="text-sm text-gray-600">
          Drag & drop files here or click Upload above
        </p>
        <p className="text-xs text-gray-400 mt-1">
          SVG, PNG, JPEG, WebP — max 10MB each
        </p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        {/* Category tabs */}
        <div className="flex gap-1 flex-wrap">
          {CATEGORIES.map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => setCategory(key)}
              className={`text-xs px-3 py-1.5 rounded-full font-medium transition ${
                category === key
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {icon} {label}
            </button>
          ))}
        </div>

        <div className="flex-1" />

        {/* Search */}
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search..."
          className="text-sm px-3 py-1.5 rounded-lg border border-gray-200 w-48 focus:border-brand-600 outline-none"
        />

        {/* Favorites toggle */}
        <button
          onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
          className={`text-sm px-3 py-1.5 rounded-lg border transition ${
            showFavoritesOnly
              ? 'border-yellow-400 bg-yellow-50 text-yellow-700'
              : 'border-gray-200 hover:bg-gray-50'
          }`}
        >
          ★ Favorites
        </button>
      </div>

      {/* Grid + Detail layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Asset grid */}
        <div className="lg:col-span-2">
          {/* Saved logos from Logo Studio */}
          {showLogosSection && !showFavoritesOnly && (
            <div className="mb-6">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Saved Logos ({savedLogos.length})
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {savedLogos.map((logo) => (
                  <div
                    key={`logo_${logo.id}`}
                    onClick={() => setSelectedId(`logo_${logo.id}`)}
                    className={`relative rounded-xl border-2 p-3 cursor-pointer transition group ${
                      selectedId === `logo_${logo.id}`
                        ? 'border-brand-600 bg-brand-50'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="aspect-square rounded-lg bg-gray-50 flex items-center justify-center overflow-hidden mb-2">
                      <div
                        className="max-w-full max-h-full [&>svg]:max-h-full [&>svg]:max-w-full"
                        dangerouslySetInnerHTML={{ __html: logo.svg }}
                      />
                    </div>
                    <div className="text-xs font-medium text-gray-700 truncate">{logo.name}</div>
                    <div className="text-[10px] text-gray-400 capitalize mt-0.5">
                      logo{logo.isPrimary ? ' · primary' : ''}
                    </div>
                    {logo.isPrimary && (
                      <span className="absolute top-2 right-2 text-[9px] px-1.5 py-0.5 bg-brand-600 text-white rounded-full">
                        Primary
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Uploaded assets */}
          {filtered.length > 0 && (
            <div>
              {showLogosSection && filtered.length > 0 && (
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Uploaded Files
                </h2>
              )}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {filtered.map((asset) => (
                  <div
                    key={asset.id}
                    onClick={() => setSelectedId(asset.id)}
                    className={`relative rounded-xl border-2 p-3 cursor-pointer transition group ${
                      selectedId === asset.id
                        ? 'border-brand-600 bg-brand-50'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    {/* Preview */}
                    <div className="aspect-square rounded-lg bg-gray-50 flex items-center justify-center overflow-hidden mb-2">
                      {asset.dataUrl || asset.url ? (
                        <img
                          src={asset.dataUrl || asset.url}
                          alt={asset.name}
                          className="max-w-full max-h-full object-contain"
                        />
                      ) : (
                        <span className="text-3xl">📄</span>
                      )}
                    </div>

                    {/* Name */}
                    <div className="text-xs font-medium text-gray-700 truncate">
                      {asset.name}
                    </div>

                    {/* Type badge */}
                    <div className="text-[10px] text-gray-400 capitalize mt-0.5">
                      {asset.type}
                    </div>

                  {/* Favorite star */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleFavorite(asset.id);
                    }}
                    className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white/80 hover:bg-white flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition"
                  >
                    {asset.favorite ? '★' : '☆'}
                  </button>

                  {/* Tags */}
                  {asset.tags.length > 0 && (
                    <div className="flex gap-1 mt-1 flex-wrap">
                      {asset.tags.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="text-[9px] px-1.5 py-0.5 bg-gray-100 rounded-full text-gray-500"
                        >
                          {tag}
                        </span>
                      ))}
                      {asset.tags.length > 2 && (
                        <span className="text-[9px] text-gray-400">
                          +{asset.tags.length - 2}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
              </div>
            </div>
          )}

          {/* Empty state — only when no logos and no uploaded assets */}
          {!showLogosSection && filtered.length === 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <div className="text-4xl mb-3">
                {assets.length === 0 ? '📦' : '🔍'}
              </div>
              <p className="text-gray-500">
                {savedLogos.length === 0 && assets.length === 0
                  ? 'No assets yet. Upload your first file or create a logo!'
                  : 'No assets match your filters.'}
              </p>
            </div>
          )}
        </div>

        {/* Detail panel */}
        <div>
          {selectedLogo ? (
            <div className="bg-white rounded-xl border border-gray-200 p-5 sticky top-4">
              {/* Preview on light */}
              <div className="aspect-square rounded-lg bg-gray-50 flex items-center justify-center overflow-hidden mb-3">
                <div
                  className="max-w-full max-h-full [&>svg]:max-h-full [&>svg]:max-w-full"
                  dangerouslySetInnerHTML={{ __html: selectedLogo.svg }}
                />
              </div>
              {/* Preview on dark */}
              <div className="aspect-square rounded-lg bg-gray-900 flex items-center justify-center overflow-hidden mb-4">
                <div
                  className="max-w-full max-h-full [&>svg]:max-h-full [&>svg]:max-w-full"
                  dangerouslySetInnerHTML={{
                    __html: selectedLogo.svg.replace(/fill="[^"]*"/g, 'fill="#ffffff"'),
                  }}
                />
              </div>

              <h3 className="font-semibold text-lg mb-1">{selectedLogo.name}</h3>
              <div className="text-xs text-gray-400 mb-4">
                Logo{selectedLogo.isPrimary ? ' · Primary' : ''}
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                <button
                  onClick={() => handleDownloadLogo(selectedLogo)}
                  className="text-xs px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 font-medium transition"
                >
                  ⬇ Download SVG
                </button>
                <button
                  onClick={() => {
                    const blob = new Blob([selectedLogo.svg], { type: 'image/svg+xml;charset=utf-8' });
                    const url = URL.createObjectURL(blob);
                    navigator.clipboard.writeText(selectedLogo.svg).then(() => {
                      URL.revokeObjectURL(url);
                    });
                  }}
                  className="text-xs px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 font-medium transition"
                >
                  📋 Copy SVG
                </button>
                {!selectedLogo.isPrimary && (
                  <button
                    onClick={() => handleSetPrimaryLogo(selectedLogo.id)}
                    className="text-xs px-3 py-2 rounded-lg border border-brand-200 text-brand-700 hover:bg-brand-50 font-medium transition"
                  >
                    ★ Set Primary
                  </button>
                )}
                <button
                  onClick={() => {
                    if (confirm('Delete this logo?')) handleDeleteLogo(selectedLogo.id);
                  }}
                  className="text-xs px-3 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 font-medium transition"
                >
                  ✕ Delete
                </button>
              </div>
            </div>
          ) : selectedAsset ? (
            <div className="bg-white rounded-xl border border-gray-200 p-5 sticky top-4">
              {/* Preview */}
              <div className="aspect-square rounded-lg bg-gray-50 flex items-center justify-center overflow-hidden mb-4">
                {selectedAsset.dataUrl || selectedAsset.url ? (
                  <img
                    src={selectedAsset.dataUrl || selectedAsset.url}
                    alt={selectedAsset.name}
                    className="max-w-full max-h-full object-contain"
                  />
                ) : (
                  <span className="text-5xl">📄</span>
                )}
              </div>

              {/* Name / Rename */}
              {renamingId === selectedAsset.id ? (
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleRename(selectedAsset.id);
                      if (e.key === 'Escape') setRenamingId(null);
                    }}
                    className="flex-1 text-sm px-2 py-1 rounded border border-gray-300 focus:border-brand-600 outline-none"
                    autoFocus
                  />
                  <button
                    onClick={() => handleRename(selectedAsset.id)}
                    className="text-xs px-2 py-1 rounded bg-gray-900 text-white"
                  >
                    Save
                  </button>
                </div>
              ) : (
                <h3
                  className="font-semibold text-lg mb-1 cursor-pointer hover:text-brand-600"
                  onClick={() => {
                    setRenamingId(selectedAsset.id);
                    setRenameValue(selectedAsset.name);
                  }}
                  title="Click to rename"
                >
                  {selectedAsset.name}
                </h3>
              )}

              <div className="text-xs text-gray-400 mb-4 capitalize">
                {selectedAsset.type} · {new Date(selectedAsset.createdAt).toLocaleDateString()}
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                <button
                  onClick={() => handleDownload(selectedAsset)}
                  className="text-xs px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 font-medium transition"
                >
                  ⬇ Download
                </button>
                <button
                  onClick={() => handleDuplicate(selectedAsset.id)}
                  className="text-xs px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 font-medium transition"
                >
                  ⧉ Duplicate
                </button>
                <button
                  onClick={() => handleToggleFavorite(selectedAsset.id)}
                  className={`text-xs px-3 py-2 rounded-lg border font-medium transition ${
                    selectedAsset.favorite
                      ? 'border-yellow-400 bg-yellow-50 text-yellow-700'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {selectedAsset.favorite ? '★ Favorited' : '☆ Favorite'}
                </button>
                <button
                  onClick={() => {
                    if (confirm('Delete this asset?')) handleDelete(selectedAsset.id);
                  }}
                  className="text-xs px-3 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 font-medium transition"
                >
                  ✕ Delete
                </button>
              </div>

              {/* Tags */}
              <div>
                <label className="text-xs font-medium text-gray-500 mb-2 block">Tags</label>
                <div className="flex gap-1 flex-wrap mb-2">
                  {selectedAsset.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2 py-0.5 bg-gray-100 rounded-full text-gray-600 flex items-center gap-1"
                    >
                      {tag}
                      <button
                        onClick={() => handleRemoveTag(selectedAsset.id, tag)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddTag(selectedAsset.id);
                    }}
                    placeholder="Add tag..."
                    className="flex-1 text-xs px-2 py-1.5 rounded border border-gray-200 focus:border-brand-600 outline-none"
                  />
                  <button
                    onClick={() => handleAddTag(selectedAsset.id)}
                    className="text-xs px-2 py-1.5 rounded bg-gray-100 hover:bg-gray-200 transition"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center sticky top-4">
              <div className="text-3xl mb-2">👆</div>
              <p className="text-sm text-gray-500">Select an asset to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
