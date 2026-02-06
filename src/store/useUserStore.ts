import { create } from "zustand";
import { User } from "@supabase/supabase-js";

export interface UserProfile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  role: "student" | "coach";
  updated_at: string | null;
}

interface UserState {
  user: User | null;
  profile: UserProfile | null;
  setUser: (user: User | null) => void;
  setProfile: (profile: UserProfile | null) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  profile: null,
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),

  updateProfile: (updates) =>
    set((state) => {
      if (!state.profile) return {};

      return {
        profile: { ...state.profile, ...updates },
      };
    }),

  clearUser: () => set({ user: null, profile: null }),
}));
