import { create } from "zustand";
import { StudentData } from "@/types/coach";

interface CoachUIState {
  // Состояния фильтрации и UI
  searchQuery: string;
  selectedActivity: string;
  selectedStudent: StudentData | null;

  // Экшны (только для изменения UI состояния)
  setSearchQuery: (query: string) => void;
  setSelectedActivity: (activity: string) => void;
  setSelectedStudent: (student: StudentData | null) => void;
}

export const useCoachStore = create<CoachUIState>((set) => ({
  // Начальные значения
  searchQuery: "",
  selectedActivity: "Все",
  selectedStudent: null,

  // Простые сеттеры
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedActivity: (activity) => set({ selectedActivity: activity }),
  setSelectedStudent: (student) => set({ selectedStudent: student }),
}));
