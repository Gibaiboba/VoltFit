import { create } from "zustand";
import { User } from "@supabase/supabase-js";
import { toISODate } from "@/lib/utils/date-utils";

interface UserState {
  user: User | null;
  selectedDate: string;
  setUser: (user: User | null) => void;
  setSelectedDate: (date: string) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  selectedDate: toISODate(new Date()),

  setUser: (user) => set({ user }),
  setSelectedDate: (date) => set({ selectedDate: date }),
  clearUser: () => set({ user: null }),
}));
