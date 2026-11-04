'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import Link from 'next/link';

interface Project {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  data: any;
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [supabaseConfigured, setSupabaseConfigured] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    if (!supabase) {
      setSupabaseConfigured(false);
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data }: { data: { session: any } }) => {
      if (!data.session?.user) {
        router.push('/login');
      } else {
        setUser(data.session.user);
        loadProjects(data.session.user.id);
      }
    });
  }, [router, supabase]);

  const loadProjects = async (userId: string) => {
    if (!supabase) return;

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error loading projects:', error);
    } else {
      setProjects(data || []);
    }
    setLoading(false);
  };

  const handleSignOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    router.push('/login');
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    if (!supabase) return;

    const { error } = await supabase.from('projects').delete().eq('id', projectId);

    if (error) {
      console.error('Error deleting project:', error);
      alert('Failed to delete project');
    } else {
      setProjects(projects.filter((p) => p.id !== projectId));
    }
  };

  if (!supabaseConfigured) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Supabase Not Configured</h1>
          <p className="text-gray-600 mb-6">
            To view your projects, please configure Supabase first.
          </p>
          <a
            href="/SUPABASE_SETUP.md"
            className="inline-block px-6 py-3 rounded-lg bg-gray-900 text-white hover:bg-gray-800"
          >
            View Setup Guide
          </a>
          <div className="mt-4">
            <a href="/" className="text-sm text-gray-600 hover:text-gray-900">
              ← Back to home
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Projects</h1>
            <p className="text-sm text-gray-600">{user?.email}</p>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/start"
              className="text-sm px-4 py-2 rounded-lg bg-gray-900 text-white hover:bg-gray-800"
            >
              + New Project
            </Link>
            <button
              onClick={handleSignOut}
              className="text-sm px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Projects Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {projects.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🎨</div>
            <h2 className="text-xl font-semibold mb-2">No projects yet</h2>
            <p className="text-gray-600 mb-6">Create your first brand identity project</p>
            <Link
              href="/start"
              className="inline-block px-6 py-3 rounded-lg bg-gray-900 text-white hover:bg-gray-800"
            >
              Start Creating
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div
                key={project.id}
                className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition"
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
                  <button
                    onClick={() => handleDeleteProject(project.id)}
                    className="text-gray-400 hover:text-red-600 text-sm"
                  >
                    ✕
                  </button>
                </div>
                <div className="text-sm text-gray-500 mb-4">
                  Updated {new Date(project.updated_at).toLocaleDateString()}
                </div>
                <Link
                  href={`/studio/${project.id}`}
                  className="block w-full text-center px-4 py-2 rounded-lg bg-gray-900 text-white hover:bg-gray-800 text-sm"
                >
                  Open Project
                </Link>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
