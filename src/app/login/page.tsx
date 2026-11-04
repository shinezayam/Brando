'use client';

import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { createClient } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [user, setUser] = useState<User | null>(null);
  const [supabaseConfigured, setSupabaseConfigured] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    if (!supabase) {
      setSupabaseConfigured(false);
      return;
    }

    supabase.auth.getSession().then(({ data }: { data: { session: any } }) => {
      if (data.session?.user) {
        router.push('/dashboard');
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      if (session?.user) {
        router.push('/dashboard');
      }
    });

    return () => subscription.unsubscribe();
  }, [router, supabase]);

  if (!supabaseConfigured) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Supabase Not Configured</h1>
          <p className="text-gray-600 mb-6">
            To enable authentication and cloud persistence, please configure Supabase.
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Brando</h1>
          <p className="text-gray-600">Sign in to save your brand projects</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#111827',
                    brandAccent: '#1f2937',
                  },
                },
              },
            }}
            providers={[]}
            view="sign_in"
            redirectTo={typeof window !== 'undefined' ? `${window.location.origin}/dashboard` : '/dashboard'}
          />
        </div>

        <div className="text-center mt-6">
          <a href="/" className="text-sm text-gray-600 hover:text-gray-900">
            ← Back to home
          </a>
        </div>
      </div>
    </div>
  );
}
