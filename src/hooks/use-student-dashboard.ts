import { useState, useMemo } from "react";
import { useUserStore, UserProfile } from "@/store/useUserStore";
import { useLogStore, Log } from "@/store/useLogStore";
import { useMealHistory } from "@/hooks/use-meal-history";
import { toast } from "sonner";
import { toISODate } from "@/lib/utils/date-utils";

export const useStudentDashboard = (
  initialHistory: Log[],
  initialProfile: UserProfile | null,
) => {
  const { user, profile, setProfile } = useUserStore();
  const { history, saveLog, setHistory, loading } = useLogStore();
  const { meals } = useMealHistory();

  // 1. Синхронизация стора (можно вынести в useEffect, если данные меняются)
  if (!profile && initialProfile) setProfile(initialProfile);
  if (history.length === 0 && initialHistory.length > 0)
    setHistory(initialHistory);

  const todayStr = useMemo(() => new Date().toLocaleDateString("en-CA"), []);
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  const [formData, setFormData] = useState({
    steps: "",
    weight: "",
    calories: "",
    sleepHours: "",
    water: 0,
    activityLevel: "День без тренировок",
  });

  // 2. Расчет съеденного (Б/Ж/У/Ккал) за выбранную дату
  const consumedFromHistory = useMemo(() => {
    const targetDate = selectedDate || toISODate(new Date());
    const dayMeals = meals.filter(
      (m) => toISODate(new Date(m.created_at)) === targetDate,
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

  // 3. Данные для графиков
  const chartData = useMemo(() => {
    const dataForChart = [...history]
      .sort(
        (a, b) =>
          new Date(a.log_date).getTime() - new Date(b.log_date).getTime(),
      )
      .slice(-7);

    return {
      steps: dataForChart.map((l) => ({
        x: l.log_date,
        y: Number(l.steps) || 0,
      })),
      calories: dataForChart.map((l) => ({
        x: l.log_date,
        y: Number(l.calories) || 0,
      })),
    };
  }, [history]);

  // 4. Обработчики
  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    const existingLog = history.find((l) => l.log_date === date);

    if (existingLog) {
      setFormData({
        steps: existingLog.steps.toString(),
        weight: existingLog.weight.toString(),
        calories: existingLog.calories.toString(),
        sleepHours: existingLog.sleep_hours.toString(),
        water: existingLog.water || 0,
        activityLevel: existingLog.activity_level || "День без тренировок",
      });
    } else {
      setFormData({
        steps: "",
        weight: history[0]?.weight?.toString() || "",
        calories: "",
        sleepHours: "",
        water: 0,
        activityLevel: "День без тренировок",
      });
    }
  };

  const handleSave = async () => {
    if (!user?.id) return toast.error("Ошибка авторизации");
    const result = await saveLog(user.id, {
      log_date: selectedDate,
      steps: parseInt(formData.steps) || 0,
      weight: parseFloat(formData.weight) || 0,
      calories:
        parseInt(formData.calories) || Math.round(consumedFromHistory.kcal),
      sleep_hours: parseFloat(formData.sleepHours) || 0,
      activity_level: formData.activityLevel,
      water: formData.water || 0,
    });
    if (result.success) toast.success("Данные сохранены");
    else toast.error(result.error);
  };

  const addWater = (amount: number) => {
    setFormData((p) => ({ ...p, water: p.water + amount }));
  };

  // 5. Вспомогательные переменные для UI
  const isToday = selectedDate === todayStr;
  const hasLog = history.some((l) => l.log_date === selectedDate);
  const activeProfile = profile || initialProfile;
  const targetCalories = activeProfile?.daily_calories || 0;
  const currentCalories =
    parseInt(formData.calories) || consumedFromHistory.kcal;
  const calProgress =
    targetCalories > 0 ? (currentCalories / targetCalories) * 100 : 0;

  return {
    state: {
      todayStr,
      profile,
      loading,
      selectedDate,
      formData,
      isToday,
      hasLog,
      consumedFromHistory,
      chartData,
      activeProfile,
      targetCalories,
      currentCalories,
      calProgress,
      history,
    },
    actions: {
      setSelectedDate,
      setFormData,
      handleDateChange,
      handleSave,
      addWater,
    },
  };
};
