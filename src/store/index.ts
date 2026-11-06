import { create } from 'zustand';
import type { BrandProject, BrandBrief, ColorSwatch, LogoVariant, BrandDNA } from '@/types';
import { createClient } from '@/lib/supabase';

interface BrandStore {
  currentProject: BrandProject | null;
  projects: BrandProject[];
  userId: string | null;
  isGuest: boolean;
  
  // Actions
  setUserId: (userId: string | null) => void;
  loadProjects: () => Promise<void>;
  createProject: (name: string, source: BrandProject['source'], brief: BrandBrief) => Promise<string>;
  updateProject: (id: string, updates: Partial<BrandProject>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  setCurrentProject: (id: string | null) => void;
  updateBrief: (brief: Partial<BrandBrief>) => Promise<void>;
  setDNA: (dna: BrandDNA) => Promise<void>;
  setPalette: (palette: ColorSwatch[]) => Promise<void>;
  setLogos: (logos: LogoVariant[]) => Promise<void>;
}

function generateId(): string {
  return `proj_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

/** Projects made while signed out (or when Supabase failed) have non-UUID ids and live in localStorage. */
const isLocalId = (id: string) => id.startsWith('proj_');

function readLocalProjects(): BrandProject[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem('brando_projects');
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Failed to load from storage:', e);
    return [];
  }
}

function writeLocalProjects(projects: BrandProject[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('brando_projects', JSON.stringify(projects.filter((p) => isLocalId(p.id))));
}

function createDemoProject(): BrandProject {
  return {
    id: 'demo',
    name: 'Demo Brand',
    locale: 'en',
    source: 'scratch',
    brief: {
      brandName: 'Mason Furniture',
      tagline: 'Crafted for Comfort',
      industry: 'Furniture & Home',
      product: 'Handcrafted wooden furniture',
      description: 'Premium handcrafted furniture for modern homes',
      brandStage: 'existing',
      languagePreference: 'en',
      targetCustomers: 'Young professionals and families',
      location: 'Ulaanbaatar, Mongolia',
      competitors: 'IKEA, local furniture shops',
      differentiation: 'Handcrafted quality with modern design',
      pricePositioning: 'Mid-premium',
      brandPromise: 'Furniture that lasts generations',
      primaryGoal: 'Build brand recognition',
      personality: {
        seriousVsPlayful: 70,
        casualVsFormal: 60,
        classicVsContemporary: 55,
        quietVsBold: 45,
        reservedVsWarm: 65,
        accessibleVsPremium: 70,
      },
      adjectives: ['warm', 'crafted', 'timeless'],
      preferredColors: ['#AB732F', '#F4D2AE'],
      applications: ['web', 'social', 'print'],
    },
    palette: [
      { id: 'c1', hex: '#AB732F', role: 'primary', locked: false },
      { id: 'c2', hex: '#F4D2AE', role: 'secondary', locked: false },
      { id: 'c3', hex: '#705138', role: 'accent', locked: false },
      { id: 'c4', hex: '#EFE6DA', role: 'background', locked: false },
      { id: 'c5', hex: '#2C2C2C', role: 'text', locked: false },
    ],
    typography: { headingFont: 'Inter', bodyFont: 'Inter' },
    logos: [
      {
        id: 'l1',
        name: 'Wordmark',
        svg: `<svg viewBox="0 0 200 60" xmlns="http://www.w3.org/2000/svg"><text x="10" y="42" font-family="Inter, sans-serif" font-size="32" font-weight="700" fill="#2C2C2C">Mason</text></svg>`,
        isPrimary: true,
      },
    ],
    assets: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    schemaVersion: 1,
  };
}

export const useBrandStore = create<BrandStore>((set, get) => ({
  currentProject: null,
  projects: [],
  userId: null,
  isGuest: true,

  setUserId: (userId) => {
    set({ userId, isGuest: !userId });
  },

  loadProjects: async () => {
    const { userId, isGuest } = get();

    if (isGuest || !userId) {
      // Load from localStorage for guests
      if (typeof window === 'undefined') return;
      try {
        const data = localStorage.getItem('brando_projects');
        if (data) {
          const projects = JSON.parse(data);
          set({ projects });
        }
      } catch (e) {
        console.error('Failed to load from storage:', e);
      }
      return;
    }

    // Load from Supabase for authenticated users
    const supabase = createClient();
    if (!supabase) {
      console.warn('Supabase not configured, falling back to localStorage');
      if (typeof window !== 'undefined') {
        try {
          const data = localStorage.getItem('brando_projects');
          if (data) {
            const projects = JSON.parse(data);
            set({ projects });
          }
        } catch (e) {
          console.error('Failed to load from storage:', e);
        }
      }
      return;
    }

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Failed to load projects:', error);
      return;
    }

    const remote = (data || []).map((p: any) => ({
      ...p.data,
      id: p.id,
    }));
    if (error) console.error('Failed to load projects from Supabase:', error);

    // keep projects that only exist locally so they never disappear after signing in
    set({ projects: [...remote, ...readLocalProjects().filter((p) => isLocalId(p.id))] });
  },

  createProject: async (name, source, brief) => {
    const { userId, isGuest } = get();
    
    if (isGuest || !userId) {
      // Guest mode: use localStorage
      const id = generateId();
      const project: BrandProject = {
        id,
        name,
        locale: 'en',
        source,
        brief,
        palette: [],
        typography: { headingFont: 'Inter', bodyFont: 'Inter' },
        logos: [],
        assets: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        schemaVersion: 1,
      };
      
      set((state) => ({
        currentProject: project,
        projects: [...state.projects, project],
      }));
      
      // Save to localStorage
      if (typeof window !== 'undefined') {
        const { projects } = get();
        localStorage.setItem('brando_projects', JSON.stringify(projects));
      }
      
      return id;
    }

    // Authenticated mode: save to Supabase
    const supabase = createClient();
    const project: BrandProject = {
      id: '', // Will be set by Supabase
      name,
      locale: 'en',
      source,
      brief,
      palette: [],
      typography: { headingFont: 'Inter', bodyFont: 'Inter' },
      logos: [],
      assets: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      schemaVersion: 1,
    };

    const { data, error } = await supabase
      .from('projects')
      .insert({
        user_id: userId,
        name,
        data: project,
      })
      .select()
      .single();

    if (error) {
      // Supabase save failed (e.g. table missing): keep the project locally so work isn't lost
      console.error('Failed to create project in Supabase, saving locally:', error);
      const localId = generateId();
      const localProject = { ...project, id: localId };
      set((state) => ({
        currentProject: localProject,
        projects: [...state.projects, localProject],
      }));
      writeLocalProjects(get().projects);
      return localId;
    }

    const newProject = { ...project, id: data.id };
    
    set((state) => ({
      currentProject: newProject,
      projects: [...state.projects, newProject],
    }));

    return data.id;
  },

  updateProject: async (id, updates) => {
    const { userId, isGuest, currentProject } = get();
    
    const updatedProject = {
      ...currentProject!,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === id ? updatedProject : p
      ),
      currentProject: currentProject?.id === id ? updatedProject : currentProject,
    }));

    if (isGuest || !userId || isLocalId(id)) {
      // Save to localStorage
      writeLocalProjects(get().projects);
      return;
    }

    // Save to Supabase
    const supabase = createClient();
    await supabase
      .from('projects')
      .update({
        name: updatedProject.name,
        data: updatedProject,
      })
      .eq('id', id)
      .eq('user_id', userId);
  },

  deleteProject: async (id) => {
    const { userId, isGuest } = get();

    set((state) => ({
      projects: state.projects.filter((p) => p.id !== id),
      currentProject: state.currentProject?.id === id ? null : state.currentProject,
    }));

    if (isGuest || !userId || isLocalId(id)) {
      writeLocalProjects(get().projects);
      return;
    }

    const supabase = createClient();
    await supabase.from('projects').delete().eq('id', id).eq('user_id', userId);
  },

  setCurrentProject: (id) => {
    if (id === 'demo') {
      set({ currentProject: createDemoProject() });
      return;
    }
    const project = get().projects.find((p) => p.id === id) || null;
    set({ currentProject: project });
  },

  updateBrief: async (briefUpdate) => {
    const { currentProject } = get();
    if (!currentProject) return;
    
    await get().updateProject(currentProject.id, {
      brief: { ...currentProject.brief, ...briefUpdate },
    });
  },

  setDNA: async (dna) => {
    const { currentProject } = get();
    if (!currentProject) return;
    
    await get().updateProject(currentProject.id, { dna });
  },

  setPalette: async (palette) => {
    const { currentProject } = get();
    if (!currentProject) return;
    
    await get().updateProject(currentProject.id, { palette });
  },

  setLogos: async (logos) => {
    const { currentProject } = get();
    if (!currentProject) return;
    
    await get().updateProject(currentProject.id, { logos });
  },
}));
