import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useMealHistory } from "@/hooks/use-meal-history";
import { toast } from "sonner";
import { toISODate } from "@/lib/utils/date-utils";
import { Log } from "@/store/useLogStore";
import { UserProfile } from "@/store/useUserStore";

// 1. Тип для данных формы (инпуты работают со строками)
export type FormDataType = {
  steps: string;
  weight: string;
  sleep_hours: string;
  water: number;
  activity_level: string;
  calories: string;
};

interface MutationContext {
  previousLogs?: Log[];
}

// 2. Тип для возвращаемого значения хука (чтобы в компоненте была автоподстановка)
export type StudentDashboardHook = {
  state: {
    loading: boolean;
    selectedDate: string;
    formData: FormDataType;
    previousWeight: string;
    isToday: boolean;
    hasLog: boolean;
    chartData: {
      steps: { x: string; y: number }[];
      calories: { x: string; y: number }[];
    };
    targetCalories: number;
    currentCalories: number;
    calProgress: number;
    history: Log[];
    consumedFromHistory: { kcal: number; p: number; f: number; c: number };
    todayStr: string;
    profile: UserProfile | null;
    isSaving: boolean;
  };
  actions: {
    handleDateChange: (date: string) => void;
    handleSave: () => void;
    addWater: () => void;
    removeWater: () => void;
    setFormData: (
      updater:
        | Partial<FormDataType>
        | ((prev: FormDataType) => Partial<FormDataType>),
    ) => void;
  };
};

export const useStudentDashboard = (
  userId: string,
  serverToday: string,
): StudentDashboardHook => {
  const queryClient = useQueryClient();
  const { meals } = useMealHistory();
  const [selectedDate, setSelectedDate] = useState<string>(serverToday);

  // Используем Record для хранения локальных правок (строки из инпутов)
  const [userInput, setUserInput] = useState<Record<string, string | number>>(
    {},
  );

  // ЗАГРУЗКА ДАННЫХ
  const { data: history = [], isLoading: logsLoading } = useQuery<Log[]>({
    queryKey: ["student-logs", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("daily_logs")
        .select("*")
        .eq("user_id", userId)
        .order("log_date", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!userId,
  });

  const { data: profile = null, isLoading: profileLoading } =
    useQuery<UserProfile | null>({
      queryKey: ["user-profile", userId],
      queryFn: async () => {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single();
        if (error) throw error;
        return data;
      },
      enabled: !!userId,
    });

  const currentLog = useMemo(
    () => history.find((l) => l.log_date === selectedDate),
    [history, selectedDate],
  );

  const addWater = () => {
    setFormData((prev) => ({ ...prev, water: (prev.water || 0) + 250 }));
  };

  const removeWater = () => {
    setFormData((prev) => ({
      ...prev,
      water: Math.max(0, (prev.water || 0) - 250),
    }));
  };

  const consumedFromHistory = useMemo(() => {
    const dayMeals = meals.filter(
      (m) => toISODate(new Date(m.created_at)) === selectedDate,
    );
    return dayMeals.reduce(
      (acc, m) => ({
        kcal: acc.kcal + (m.total_kcal || 0),
        p: acc.p + (m.total_p || 0),
        f: acc.f + (m.total_f || 0),
        c: acc.c + (m.total_c || 0),
      }),
      { kcal: 0, p: 0, f: 0, c: 0 },
    );
  }, [meals, selectedDate]);

  const previousWeight = useMemo(() => {
    // history у нас отсортирована: [2024-05-20, 2024-05-19, 2024-05-15...]
    // Ищем первый лог, дата которого меньше выбранной
    const prevLog = history.find((l) => l.log_date < selectedDate && l.weight);
    return prevLog?.weight ? prevLog.weight.toString() : "--";
  }, [history, selectedDate]);

  // ГИБРИДНЫЕ ДАННЫЕ
  const formData = useMemo<FormDataType>(() => {
    return {
      steps: (userInput.steps ?? currentLog?.steps ?? "").toString(),
      // Здесь оставляем только текущий вес для этой даты
      weight: (userInput.weight ?? currentLog?.weight ?? "").toString(),
      sleep_hours: (
        userInput.sleep_hours ??
        currentLog?.sleep_hours ??
        ""
      ).toString(),
      water: Number(userInput.water ?? currentLog?.water ?? 0),
      activity_level: (
        userInput.activity_level ??
        currentLog?.activity_level ??
        "День без тренировок"
      ).toString(),
      calories: (currentLog?.calories ?? "0").toString(),
    };
  }, [userInput, currentLog]);

  // МУТАЦИЯ
  const saveMutation = useMutation<void, Error, Partial<Log>, MutationContext>({
    mutationFn: async (logData) => {
      const { error } = await supabase
        .from("daily_logs")
        .upsert(
          { user_id: userId, ...logData },
          { onConflict: "user_id,log_date" },
        );
      if (error) throw error;
    },

    onMutate: async (newLogData): Promise<MutationContext> => {
      await queryClient.cancelQueries({ queryKey: ["student-logs", userId] });

      const previousLogs = queryClient.getQueryData<Log[]>([
        "student-logs",
        userId,
      ]);

      queryClient.setQueryData<Log[]>(["student-logs", userId], (old = []) => {
        const exists = old.some((l) => l.log_date === newLogData.log_date);
        if (exists) {
          return old.map((l) =>
            l.log_date === newLogData.log_date ? { ...l, ...newLogData } : l,
          );
        }
        return [newLogData as Log, ...old].sort(
          (a, b) =>
            new Date(b.log_date).getTime() - new Date(a.log_date).getTime(),
        );
      });

      return { previousLogs };
    },
    onError: (err, newLogData, context) => {
      if (context?.previousLogs) {
        queryClient.setQueryData(
          ["student-logs", userId],
          context.previousLogs,
        );
      }

      // Применение err: логируем конкретную причину
      console.error(
        `Ошибка при сохранении лога за ${newLogData.log_date}:`,
        err.message,
      );

      // Применение newLogData: говорим пользователю, что именно не сохранилось
      toast.error(
        `Не удалось сохранить данные за ${newLogData.log_date}. Попробуйте еще раз.`,
      );
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["student-logs", userId] });
    },
  });

  // ОБРАБОТЧИКИ
  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    setUserInput({});
  };

  const setFormData: StudentDashboardHook["actions"]["setFormData"] = (
    updater,
  ) => {
    if (typeof updater === "function") {
      setUserInput((prev) => {
        const next = updater(formData);
        return { ...prev, ...next };
      });
    } else {
      setUserInput((prev) => ({ ...prev, ...updater }));
    }
  };

  const handleSave = () => {
    const finalCalories =
      consumedFromHistory.kcal > 0
        ? Math.round(consumedFromHistory.kcal)
        : parseInt(formData.calories) || 0;

    saveMutation.mutate({
      log_date: selectedDate,
      steps: parseInt(formData.steps) || 0,
      weight: parseFloat(formData.weight) || 0,
      calories: finalCalories,
      sleep_hours: parseFloat(formData.sleep_hours) || 0,
      water: formData.water,
      activity_level: formData.activity_level,
    });
  };

  const chartData = useMemo(() => {
    const sorted = [...history]
      .sort(
        (a, b) =>
          new Date(a.log_date).getTime() - new Date(b.log_date).getTime(),
      )
      .slice(-7);

    return {
      // Используем оператор || 0, чтобы гарантировать число
      steps: sorted.map((l) => ({
        x: l.log_date,
        y: l.steps || 0,
      })),
      calories: sorted.map((l) => ({
        x: l.log_date,
        y: l.calories || 0,
      })),
    };
  }, [history]);

  const targetCalories = profile?.daily_calories || 0;
  const currentCalories =
    consumedFromHistory.kcal > 0
      ? Math.round(consumedFromHistory.kcal)
      : parseInt(formData.calories) || 0;

  return {
    state: {
      loading: logsLoading || profileLoading,
      selectedDate,
      formData,
      previousWeight,
      isToday: selectedDate === serverToday,
      hasLog: !!currentLog,
      chartData,
      targetCalories,
      currentCalories,
      calProgress:
        targetCalories > 0 ? (currentCalories / targetCalories) * 100 : 0,
      history,
      consumedFromHistory,
      todayStr: serverToday,
      profile,
      isSaving: saveMutation.isPending,
    },
    actions: {
      handleDateChange,
      handleSave,
      setFormData,
      addWater,
      removeWater,
    },
  };
};
