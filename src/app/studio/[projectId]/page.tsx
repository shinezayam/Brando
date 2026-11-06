'use client';

import { useBrandStore } from '@/store';

export default function StudioOverview() {
  const { currentProject } = useBrandStore();

  if (!currentProject) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading project...</div>
      </div>
    );
  }

  const primaryLogo = currentProject.logos.find((l) => l.isPrimary) || currentProject.logos[0];

  return (
    <div className="max-w-4xl">
      <h1 className="text-3xl font-bold mb-2">{currentProject.name}</h1>
      <p className="text-gray-600 mb-8">
        {currentProject.brief.industry} · {currentProject.brief.brandStage === 'new' ? 'New brand' : 'Existing brand'}
      </p>

      {/* Primary logo preview */}
      {primaryLogo && (
        <div className="bg-white rounded-xl border border-gray-200 p-8 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Primary Logo</h2>
            <a
              href={`/studio/${currentProject.id}/logo`}
              className="text-sm text-brand-600 hover:text-brand-700"
            >
              Open Logo Studio →
            </a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-gray-100 p-8 flex items-center justify-center bg-white">
              <div
                className="max-w-full [&>svg]:max-h-32 [&>svg]:w-auto"
                dangerouslySetInnerHTML={{ __html: primaryLogo.svg }}
              />
            </div>
            <div className="rounded-xl border border-gray-100 p-8 flex items-center justify-center bg-gray-900">
              <div
                className="max-w-full [&>svg]:max-h-32 [&>svg]:w-auto"
                dangerouslySetInnerHTML={{
                  __html: primaryLogo.svg.replace(/fill="[^"]*"/g, 'fill="#ffffff"'),
                }}
              />
            </div>
          </div>
          <div className="text-sm text-gray-500 mt-3 text-center">{primaryLogo.name}</div>
        </div>
      )}

      {/* Quick stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="text-sm text-gray-500 mb-1">Colors</div>
          <div className="text-2xl font-bold">{currentProject.palette.length}</div>
          <div className="flex gap-1 mt-3">
            {currentProject.palette.slice(0, 5).map((swatch) => (
              <div
                key={swatch.id}
                className="w-8 h-8 rounded-md border border-gray-200"
                style={{ backgroundColor: swatch.hex }}
              />
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="text-sm text-gray-500 mb-1">Logo Variants</div>
          <div className="text-2xl font-bold">{currentProject.logos.length}</div>
          <div className="text-sm text-gray-400 mt-3">
            {primaryLogo?.name || 'No primary logo'}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="text-sm text-gray-500 mb-1">Brand DNA</div>
          <div className="text-2xl font-bold">{currentProject.dna ? '✓' : '—'}</div>
          <div className="text-sm text-gray-400 mt-3">
            {currentProject.dna ? 'Generated' : 'Not generated yet'}
          </div>
        </div>
      </div>

      {/* Brief summary */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Brief Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Brand Name:</span>{' '}
            <span className="font-medium">{currentProject.brief.brandName}</span>
          </div>
          {currentProject.brief.tagline && (
            <div>
              <span className="text-gray-500">Tagline:</span>{' '}
              <span className="font-medium">{currentProject.brief.tagline}</span>
            </div>
          )}
          <div>
            <span className="text-gray-500">Industry:</span>{' '}
            <span className="font-medium">{currentProject.brief.industry}</span>
          </div>
          {currentProject.brief.location && (
            <div>
              <span className="text-gray-500">Market:</span>{' '}
              <span className="font-medium">{currentProject.brief.location}</span>
            </div>
          )}
          <div>
            <span className="text-gray-500">Applications:</span>{' '}
            <span className="font-medium">{currentProject.brief.applications.join(', ')}</span>
          </div>
        </div>
      </div>

      {/* All logo variants */}
      {currentProject.logos.length > 1 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">All Logo Variants</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {currentProject.logos.map((logo) => (
              <div
                key={logo.id}
                className={`rounded-lg border-2 p-4 ${logo.isPrimary ? 'border-brand-600 bg-brand-50' : 'border-gray-200'}`}
              >
                {logo.isPrimary && (
                  <span className="text-xs px-2 py-0.5 bg-brand-600 text-white rounded-full mb-2 inline-block">Primary</span>
                )}
                <div
                  className="w-full h-16 flex items-center justify-center [&>svg]:max-h-full [&>svg]:max-w-full"
                  dangerouslySetInnerHTML={{ __html: logo.svg }}
                />
                <div className="text-xs text-gray-500 mt-2 text-center truncate">{logo.name}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Next steps */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-blue-900 mb-2">Next Steps</h2>
        <ul className="space-y-2 text-sm text-blue-800">
          {currentProject.palette.length === 0 && (
            <li>→ Generate your brand colors in the <a href={`/studio/${currentProject.id}/colors`} className="underline">Color Studio</a></li>
          )}
          {currentProject.logos.length === 0 && (
            <li>→ Create logo variants in the <a href={`/studio/${currentProject.id}/logo`} className="underline">Logo Editor</a></li>
          )}
          {!currentProject.dna && (
            <li>→ Generate Brand DNA for strategy and messaging</li>
          )}
          {currentProject.palette.length > 0 && currentProject.logos.length > 0 && currentProject.dna && (
            <li>→ Export your <a href={`/studio/${currentProject.id}/brandbook`} className="underline">brandbook</a> — everything is ready!</li>
          )}
          {currentProject.logos.length > 0 && (
            <li>→ Upload more files in the <a href={`/studio/${currentProject.id}/assets`} className="underline">Asset Manager</a></li>
          )}
        </ul>
      </div>
    </div>
  );
}
