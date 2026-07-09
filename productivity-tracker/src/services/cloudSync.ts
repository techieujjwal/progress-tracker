import { supabase, isSupabaseConfigured } from './supabaseClient';
import type { UserState, Task, TimetableTemplate, UserProfile } from '../types';
import type { Session, User } from '@supabase/supabase-js';

export type SyncStatus = 'synced' | 'syncing' | 'offline' | 'error';

export interface AuthResult {
  success: boolean;
  error?: string;
}

export interface PublicProfile {
  username: string;
  avatarUrl: string;
  theme: string;
  accentColor: string;
  xp: number;
  level: number;
  logs: Record<string, Task[]>;
}

function mapProfileRow(row: Record<string, unknown>): Partial<UserProfile> {
  return {
    username: row.username as string,
    avatarUrl: (row.avatar_url as string) || '',
    theme: (row.theme as UserProfile['theme']) || 'dark',
    accentColor: (row.accent_color as string) || '#3b82f6',
    animationsEnabled: row.animations_enabled as boolean,
    notificationsEnabled: row.notifications_enabled as boolean
  };
}

export const cloudService = {
  get available() {
    return isSupabaseConfigured && supabase !== null;
  },

  async getSession(): Promise<Session | null> {
    if (!supabase) return null;
    const { data } = await supabase.auth.getSession();
    return data.session;
  },

  async getUser(): Promise<User | null> {
    if (!supabase) return null;
    const { data } = await supabase.auth.getUser();
    return data.user;
  },

  onAuthStateChange(callback: (session: Session | null) => void) {
    if (!supabase) return { unsubscribe: () => {} };
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      callback(session);
    });
    return data.subscription;
  },

  async signUpWithEmail(email: string, password: string, username: string): Promise<AuthResult> {
    if (!supabase) return { success: false, error: 'Supabase not configured' };
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username }
      }
    });
    if (error) return { success: false, error: error.message };
    return { success: true };
  },

  async signInWithEmail(email: string, password: string): Promise<AuthResult> {
    if (!supabase) return { success: false, error: 'Supabase not configured' };
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { success: false, error: error.message };
    return { success: true };
  },

  async signInWithGoogle(): Promise<AuthResult> {
    if (!supabase) return { success: false, error: 'Supabase not configured' };
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    });
    if (error) return { success: false, error: error.message };
    return { success: true };
  },

  async signOut(): Promise<void> {
    if (!supabase) return;
    await supabase.auth.signOut();
  },

  async pushProfile(userId: string, profile: UserProfile, xp: number, level: number, publicSharing: boolean): Promise<void> {
    if (!supabase) return;
    const { error } = await supabase.from('profiles').upsert({
      id: userId,
      username: profile.username,
      avatar_url: profile.avatarUrl,
      theme: profile.theme,
      accent_color: profile.accentColor,
      animations_enabled: profile.animationsEnabled,
      notifications_enabled: profile.notificationsEnabled,
      public_sharing: publicSharing,
      xp,
      level,
      updated_at: new Date().toISOString()
    });
    if (error) throw error;
  },

  async pullProfile(userId: string): Promise<{ profile: Partial<UserProfile>; xp: number; level: number; publicSharing: boolean } | null> {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (error || !data) return null;
    return {
      profile: mapProfileRow(data),
      xp: data.xp as number,
      level: data.level as number,
      publicSharing: data.public_sharing as boolean
    };
  },

  async pushLogs(userId: string, logs: Record<string, Task[]>): Promise<void> {
    if (!supabase) return;
    const rows = Object.entries(logs).map(([date, tasks]) => ({
      user_id: userId,
      date,
      tasks,
      updated_at: new Date().toISOString()
    }));

    const batchSize = 50;
    for (let i = 0; i < rows.length; i += batchSize) {
      const batch = rows.slice(i, i + batchSize);
      const { error } = await supabase.from('logs').upsert(batch, { onConflict: 'user_id,date' });
      if (error) throw error;
    }
  },

  async pullLogs(userId: string): Promise<Record<string, Task[]>> {
    if (!supabase) return {};
    const result: Record<string, Task[]> = {};
    let from = 0;
    const pageSize = 1000;

    while (true) {
      const { data, error } = await supabase
        .from('logs')
        .select('date, tasks')
        .eq('user_id', userId)
        .range(from, from + pageSize - 1);

      if (error || !data || data.length === 0) break;

      data.forEach((row: { date: string; tasks: unknown }) => {
        const tasks = typeof row.tasks === 'string' ? JSON.parse(row.tasks) : row.tasks;
        result[row.date] = tasks as Task[];
      });

      if (data.length < pageSize) break;
      from += pageSize;
    }

    return result;
  },

  async pushTemplates(userId: string, templates: TimetableTemplate[]): Promise<void> {
    if (!supabase) return;
    const rows = templates.map(t => ({
      id: t.id,
      user_id: userId,
      name: t.name,
      tasks: t.tasks,
      updated_at: new Date().toISOString()
    }));
    const { error } = await supabase.from('templates').upsert(rows, { onConflict: 'id,user_id' });
    if (error) throw error;
  },

  async pullTemplates(userId: string): Promise<TimetableTemplate[]> {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('templates')
      .select('id, name, tasks')
      .eq('user_id', userId);

    if (error || !data) return [];
    return data.map((row: { id: string; name: string; tasks: unknown }) => ({
      id: row.id,
      name: row.name,
      tasks: typeof row.tasks === 'string' ? JSON.parse(row.tasks) : row.tasks
    })) as TimetableTemplate[];
  },

  async pushSingleLog(userId: string, date: string, tasks: Task[]): Promise<void> {
    if (!supabase) return;
    const { error } = await supabase.from('logs').upsert({
      user_id: userId,
      date,
      tasks,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id,date' });
    if (error) throw error;
  },

  async fetchPublicProfile(username: string): Promise<PublicProfile | null> {
    if (!supabase) return null;
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('username', username)
      .eq('public_sharing', true)
      .single();

    if (profileError || !profileData) return null;

    const userId = profileData.id as string;
    const logs = await this.pullLogs(userId);

    return {
      username: profileData.username as string,
      avatarUrl: (profileData.avatar_url as string) || '',
      theme: (profileData.theme as string) || 'dark',
      accentColor: (profileData.accent_color as string) || '#3b82f6',
      xp: profileData.xp as number,
      level: profileData.level as number,
      logs
    };
  },

  async fullSync(userId: string, localState: UserState, publicSharing: boolean): Promise<UserState> {
    const cloudLogs = await this.pullLogs(userId);
    const cloudProfileData = await this.pullProfile(userId);
    const cloudTemplates = await this.pullTemplates(userId);

    const mergedLogs = { ...localState.logs };
    Object.entries(cloudLogs).forEach(([date, cloudTasks]) => {
      if (cloudTasks && cloudTasks.length > 0) {
        mergedLogs[date] = cloudTasks;
      }
    });

    const mergedProfile = cloudProfileData
      ? { ...localState.profile, ...cloudProfileData.profile }
      : localState.profile;

    const mergedTemplates = cloudTemplates.length > 0 ? cloudTemplates : localState.templates;
    const mergedXp = cloudProfileData ? Math.max(localState.xp, cloudProfileData.xp) : localState.xp;
    const mergedLevel = cloudProfileData ? Math.max(localState.level, cloudProfileData.level) : localState.level;

    const mergedState: UserState = {
      ...localState,
      logs: mergedLogs,
      profile: mergedProfile,
      templates: mergedTemplates,
      xp: mergedXp,
      level: mergedLevel,
      lastSynced: new Date().toISOString()
    };

    await this.pushLogs(userId, mergedLogs);
    await this.pushProfile(userId, mergedProfile, mergedXp, mergedLevel, publicSharing);
    await this.pushTemplates(userId, mergedTemplates);

    return mergedState;
  }
};
