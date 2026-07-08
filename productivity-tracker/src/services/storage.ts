import type { UserState } from '../types';

const STORAGE_KEY = 'lifesync_state_v1';

export const storageService = {
  saveState(state: UserState): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Failed to save state to localStorage', e);
    }
  },

  loadState(): UserState | null {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error('Failed to load state from localStorage', e);
      return null;
    }
  },

  clearState(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error('Failed to clear state', e);
    }
  }
};
