import { create } from "zustand";
import { supabase } from "@/lib/supabase";

export interface Log {
  log_date: string;
  steps: number;
  weight: number;
  calories: number;
  sleep_hours: number;
  activity_level: string;
}

interface LogState {
  history: Log[];
  loading: boolean;
  // Загрузка данных из БД
  fetchHistory: (userId: string) => Promise<void>;
  // Сохранение новой записи (или обновление старой)
  saveLog: (
    userId: string,
    logData: Omit<Log, "user_id">,
  ) => Promise<{ success: boolean; error?: string }>;
}

export const useLogStore = create<LogState>((set, get) => ({
  history: [],
  loading: false,

  fetchHistory: async (userId) => {
    set({ loading: true });
    const { data, error } = await supabase
      .from("daily_logs")
      .select("*")
      .eq("user_id", userId)
      .order("log_date", { ascending: false });

    if (!error) set({ history: data as Log[] });
    set({ loading: false });
  },

  saveLog: async (userId, logData) => {
    // 1. Сначала сохраняем в базу через upsert
    const { data, error } = await supabase
      .from("daily_logs")
      .upsert({ user_id: userId, ...logData })
      .select()
      .single();

    if (error) return { success: false, error: error.message };

    // 2. Обновляем локальный стор без повторного запроса к БД
    const currentHistory = get().history;
    const index = currentHistory.findIndex((l) => l.log_date === data.log_date);

    if (index !== -1) {
      // Если запись за это число была — обновляем её в массиве
      const newHistory = [...currentHistory];
      newHistory[index] = data as Log;
      set({ history: newHistory });
    } else {
      // Если это новая дата — добавляем в начало и сортируем
      set({ history: [data as Log, ...currentHistory] });
    }

    return { success: true };
  },
}));
