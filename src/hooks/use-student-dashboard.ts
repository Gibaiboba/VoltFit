import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useUserStore } from "@/store/useUserStore";
import { useMealHistory } from "@/hooks/use-meal-history";
import { toast } from "sonner";
import { toISODate } from "@/lib/utils/date-utils";
import { Log } from "@/store/useLogStore";
import { UserProfile } from "@/store/useUserStore";

export const useStudentDashboard = (
  initialHistory: Log[],
  initialProfile: UserProfile | null,
  serverToday: string,
) => {
  const { user } = useUserStore();
  const queryClient = useQueryClient();
  const { meals } = useMealHistory();

  // 1. ПОЛУЧЕНИЕ ДАННЫХ
  const { data: history = initialHistory, isLoading: loading } = useQuery({
    queryKey: ["student-logs", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("daily_logs")
        .select("*")
        .eq("user_id", user?.id)
        .order("log_date", { ascending: false });
      if (error) throw error;
      return data as Log[];
    },
    initialData: initialHistory,
    enabled: !!user?.id,
  });

  // Используем серверную дату вместо new Date()
  const [selectedDate, setSelectedDate] = useState<string>(serverToday);

  // Инициализируем форму сразу правильными данными для serverToday
  const [formData, setFormData] = useState(() => {
    const log = initialHistory.find((l) => l.log_date === serverToday);
    return {
      steps: log?.steps?.toString() || "",
      weight:
        log?.weight?.toString() || initialHistory[0]?.weight?.toString() || "",
      calories: log?.calories?.toString() || "",
      sleepHours: log?.sleep_hours?.toString() || "",
      water: log?.water || 0,
      activityLevel: log?.activity_level || "День без тренировок",
    };
  });

  // 2. МУТАЦИЯ (Сохранение данных)
  const saveMutation = useMutation({
    mutationFn: async (logData: Partial<Log>) => {
      const { error } = await supabase
        .from("daily_logs")
        .upsert(
          { user_id: user?.id, ...logData },
          { onConflict: "user_id,log_date" },
        );

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student-logs", user?.id] });
      toast.success("Данные успешно сохранены ✨");
    },
    onError: (err: unknown) => {
      const errorMessage =
        err instanceof Error ? err.message : "Произошла неизвестная ошибка";
      toast.error(`Ошибка: ${errorMessage}`);
    },
  });

  // 3. РАСЧЕТЫ
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

  const chartData = useMemo(() => {
    const sorted = [...history]
      .sort(
        (a, b) =>
          new Date(a.log_date).getTime() - new Date(b.log_date).getTime(),
      )
      .slice(-7);

    return {
      steps: sorted.map((l) => ({ x: l.log_date, y: l.steps })),
      calories: sorted.map((l) => ({ x: l.log_date, y: l.calories })),
    };
  }, [history]);

  // 4. ОБРАБОТЧИКИ
  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    const log = history.find((l) => l.log_date === date);
    setFormData({
      steps: log?.steps?.toString() || "",
      weight: log?.weight?.toString() || history[0]?.weight?.toString() || "",
      calories: log?.calories?.toString() || "",
      sleepHours: log?.sleep_hours?.toString() || "",
      water: log?.water || 0,
      activityLevel: log?.activity_level || "День без тренировок",
    });
  };

  const handleSave = () => {
    // Определяем, что именно мы сохраняем в колонку calories
    const finalCalories =
      consumedFromHistory.kcal > 0
        ? Math.round(consumedFromHistory.kcal)
        : parseInt(formData.calories) || 0;

    saveMutation.mutate({
      log_date: selectedDate,
      steps: parseInt(formData.steps) || 0,
      weight: parseFloat(formData.weight) || 0,
      calories: finalCalories, // Теперь здесь всегда актуальная сумма
      sleep_hours: parseFloat(formData.sleepHours) || 0,
      water: formData.water,
      activity_level: formData.activityLevel,
    });
  };

  const targetCalories = initialProfile?.daily_calories || 0;
  const currentCalories =
    consumedFromHistory.kcal > 0
      ? Math.round(consumedFromHistory.kcal)
      : parseInt(formData.calories) || 0;

  return {
    state: {
      loading,
      selectedDate,
      formData,
      isToday: selectedDate === serverToday,
      hasLog: history.some((l) => l.log_date === selectedDate),
      chartData,
      targetCalories,
      currentCalories,
      calProgress:
        targetCalories > 0 ? (currentCalories / targetCalories) * 100 : 0,
      history,
      consumedFromHistory,
      todayStr: serverToday,
    },
    actions: {
      handleDateChange,
      handleSave,
      setFormData,
      isSaving: saveMutation.isPending,
    },
  };
};
