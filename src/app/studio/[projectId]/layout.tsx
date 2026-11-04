'use client';

import { useEffect } from 'react';
import { useParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import { I18nProvider, useI18n } from '@/i18n';
import { useBrandStore } from '@/store';

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return (
    <I18nProvider>
      <StudioShell>{children}</StudioShell>
    </I18nProvider>
  );
}

function StudioShell({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const pathname = usePathname();
  const projectId = params.projectId as string;
  const { currentProject, setCurrentProject, loadProjects } = useBrandStore();
  const { locale, setLocale, t } = useI18n();

  useEffect(() => {
    loadProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (projectId) {
      setCurrentProject(projectId);
    }
  }, [projectId, setCurrentProject]);

  const navItems = [
    { href: `/studio/${projectId}`, label: 'Overview', icon: '🏠', exact: true },
    { href: `/studio/${projectId}/logo`, label: 'Logo', icon: '✏️' },
    { href: `/studio/${projectId}/colors`, label: 'Colors', icon: '🎨' },
    { href: `/studio/${projectId}/typography`, label: 'Typography', icon: '🔤' },
    { href: `/studio/${projectId}/dna`, label: 'Brand DNA', icon: '💎' },
    { href: `/studio/${projectId}/assets`, label: 'Assets', icon: '📦' },
    { href: `/studio/${projectId}/brandbook`, label: 'Brandbook', icon: '📖' },
  ];

  const isActive = (item: typeof navItems[0]) => {
    if (item.exact) return pathname === item.href;
    return pathname.startsWith(item.href);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col fixed h-full">
        {/* Project name */}
        <div className="p-6 border-b border-gray-100">
          <Link href="/" className="text-xl font-bold text-gray-900 mb-2 block">
            Brando
          </Link>
          <div className="text-sm font-medium text-gray-700 truncate">
            {currentProject?.name || 'Loading...'}
          </div>
          {projectId === 'demo' && (
            <span className="inline-block mt-1 text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full">
              Demo
            </span>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${
                isActive(item)
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Bottom controls */}
        <div className="p-4 border-t border-gray-100 space-y-3">
          <button
            onClick={() => setLocale(locale === 'en' ? 'mn' : 'en')}
            className="w-full text-sm px-3 py-2 rounded-md border border-gray-200 hover:bg-gray-50 transition text-left"
          >
            🌐 {locale === 'en' ? 'Монгол' : 'English'}
          </button>
          <Link
            href="/"
            className="block w-full text-sm px-3 py-2 rounded-md border border-gray-200 hover:bg-gray-50 transition text-center text-gray-600"
          >
            ← Back to Home
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 ml-64">
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">
              {currentProject ? 'Saved' : 'Loading...'}
            </span>
            {currentProject && (
              <span className="w-2 h-2 rounded-full bg-green-500" />
            )}
          </div>
          <div className="flex items-center gap-3">
            <button className="text-sm px-4 py-2 rounded-md border border-gray-200 hover:bg-gray-50 transition">
              Export
            </button>
          </div>
        </header>

        {/* Page content */}
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
