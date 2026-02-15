import { create } from "zustand";
import { supabase } from "@/lib/supabase";

export interface StudentLog {
  weight: number;
  steps: number;
  calories: number;
  sleep_hours: number;
  activity_level: string;
  log_date: string;
}

export interface StudentData {
  student: {
    full_name: string;
    daily_logs: StudentLog[];
  };
}

interface CoachState {
  students: StudentData[];
  selectedStudent: StudentData | null;
  loading: boolean;

  // Состояния фильтрации
  searchQuery: string;
  selectedActivity: string; // "Все", "Силовая тренировка" и т.д.

  // Экшны
  fetchStudents: () => Promise<void>;
  setSelectedStudent: (student: StudentData | null) => void;
  setSearchQuery: (query: string) => void;
  setSelectedActivity: (activity: string) => void;

  // Вычисляемые данные
  getFilteredStudents: () => StudentData[];
  getWeeklySteps: (item: StudentData) => number;
}

export const useCoachStore = create<CoachState>((set, get) => ({
  students: [],
  selectedStudent: null,
  loading: false,
  searchQuery: "",
  selectedActivity: "Все",

  setSearchQuery: (query) => set({ searchQuery: query }),

  setSelectedActivity: (activity) => set({ selectedActivity: activity }),

  setSelectedStudent: (student) => set({ selectedStudent: student }),

  fetchStudents: async () => {
    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from("coach_students")
        .select(
          `
          student:profiles!student_id (
            full_name,
            daily_logs ( 
              weight, steps, calories, sleep_hours, activity_level, log_date 
            )
          )
        `,
        )
        .order("log_date", {
          foreignTable: "profiles.daily_logs",
          ascending: false,
        });

      if (error) throw error;
      set({ students: (data as unknown as StudentData[]) || [] });
    } catch (err) {
      console.error("Ошибка стора:", err);
    } finally {
      set({ loading: false });
    }
  },

  // Умная фильтрация: совмещаем поиск и тип активности
  getFilteredStudents: () => {
    const { students, searchQuery, selectedActivity } = get();

    return students.filter((item) => {
      const lastLog = item.student.daily_logs?.[0];

      // Проверка по имени
      const matchesSearch = item.student.full_name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

      // Проверка по активности
      const matchesActivity =
        selectedActivity === "Все" ||
        lastLog?.activity_level === selectedActivity;

      return matchesSearch && matchesActivity;
    });
  },

  getWeeklySteps: (item) => {
    return (
      item.student.daily_logs
        ?.slice(0, 7)
        .reduce((sum, log) => sum + (log.steps || 0), 0) || 0
    );
  },
}));
