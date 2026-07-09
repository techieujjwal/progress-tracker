import { create } from 'zustand';
import type { Session } from '@supabase/supabase-js';
import { cloudService } from '../services/cloudSync';
import type { SyncStatus, PublicProfile } from '../services/cloudSync';

interface AuthState {
  session: Session | null;
  syncStatus: SyncStatus;
  publicSharing: boolean;
  isAuthModalOpen: boolean;
  publicViewerProfile: PublicProfile | null;
  isPublicViewMode: boolean;
}

interface AuthActions {
  setSession: (session: Session | null) => void;
  setSyncStatus: (status: SyncStatus) => void;
  setPublicSharing: (enabled: boolean) => void;
  setAuthModalOpen: (open: boolean) => void;
  setPublicViewerProfile: (profile: PublicProfile | null) => void;
  setPublicViewMode: (enabled: boolean) => void;
  signOut: () => Promise<void>;
  initializeAuth: () => Promise<void>;
  loadPublicProfile: (username: string) => Promise<boolean>;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>((set) => ({
  session: null,
  syncStatus: cloudService.available ? 'offline' : 'offline',
  publicSharing: false,
  isAuthModalOpen: false,
  publicViewerProfile: null,
  isPublicViewMode: false,

  setSession: (session) => set({ session }),
  setSyncStatus: (status) => set({ syncStatus: status }),
  setPublicSharing: (enabled) => set({ publicSharing: enabled }),
  setAuthModalOpen: (open) => set({ isAuthModalOpen: open }),
  setPublicViewerProfile: (profile) => set({ publicViewerProfile: profile }),
  setPublicViewMode: (enabled) => set({ isPublicViewMode: enabled }),

  signOut: async () => {
    await cloudService.signOut();
    set({ session: null, syncStatus: 'offline', publicSharing: false });
  },

  initializeAuth: async () => {
    if (!cloudService.available) return;
    const session = await cloudService.getSession();
    if (session) {
      set({ session, syncStatus: 'synced' });
      const profileData = await cloudService.pullProfile(session.user.id);
      if (profileData) {
        set({ publicSharing: profileData.publicSharing });
      }
    }

    cloudService.onAuthStateChange((newSession) => {
      set({
        session: newSession,
        syncStatus: newSession ? 'synced' : 'offline'
      });
    });
  },

  loadPublicProfile: async (username: string) => {
    const profile = await cloudService.fetchPublicProfile(username);
    if (profile) {
      set({ publicViewerProfile: profile, isPublicViewMode: true });
      return true;
    }
    return false;
  }
}));
