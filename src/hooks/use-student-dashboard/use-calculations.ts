import { useMemo } from "react";
import { Log, FormDataType } from "./types";
import { SavedMeal } from "@/types/food";
import { UserProfile } from "@/types/user";
import { useNutritionStats } from "../use-nutrition-stats";
import { getPreviousWeight } from "@/lib/utils/weight-utils";

export const useDashboardCalculations = (
  history: Log[],
  profile: UserProfile | null,
  meals: SavedMeal[],
  selectedDate: string,
  userInput: Record<string, string | number>,
  serverToday: string,
) => {
  // 1. Целевые калории из профиля (с fallback значением)
  const targetCalories = useMemo(
    () => profile?.daily_calories || 2000,
    [profile],
  );

  // 2. Использование единого хука для расчетов БЖУ и калорий из еды
  const { roundedStats } = useNutritionStats(
    meals,
    selectedDate,
    targetCalories,
  );

  // 3. Поиск текущего лога в истории для выбранной даты
  const currentLog = useMemo(
    () => history.find((l) => l.log_date === selectedDate),
    [history, selectedDate],
  );

  // 4. Поиск предыдущего записанного веса через изолированную утилиту
  const previousWeight = useMemo(() => {
    return getPreviousWeight(history, selectedDate);
  }, [history, selectedDate]);

  // 5. Формирование данных для формы ввода (черновик пользователя > лог из БД > пустая строка)
  const formData = useMemo<FormDataType>(() => {
    return {
      steps: (userInput.steps ?? currentLog?.steps ?? "").toString(),
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

  // 6. Итоговые калории (Приоритет: Записи еды из дневника > Ручной ввод в лог)
  const currentCalories = useMemo(() => {
    const kcal =
      roundedStats.kcal > 0
        ? roundedStats.kcal
        : parseInt(formData.calories) || 0;
    return Math.round(kcal);
  }, [roundedStats.kcal, formData.calories]);

  // 7. Расчет прогресса по калориям для шкалы
  const calProgress = useMemo(() => {
    if (!targetCalories || targetCalories <= 0) return 0;
    return Math.min((currentCalories / targetCalories) * 100, 100);
  }, [currentCalories, targetCalories]);

  // 8. Подготовка исторических данных для графиков (последние 7 отчетов)
  const chartData = useMemo(() => {
    const sorted = [...history]
      .sort((a, b) => a.log_date.localeCompare(b.log_date))
      .slice(-7);

    return {
      steps: sorted.map((l) => ({ x: l.log_date, y: l.steps || 0 })),
      calories: sorted.map((l) => ({ x: l.log_date, y: l.calories || 0 })),
    };
  }, [history]);

  // 9. Вспомогательные флаги
  const isToday = useMemo(
    () => selectedDate === serverToday,
    [selectedDate, serverToday],
  );

  const hasLog = useMemo(() => !!currentLog, [currentLog]);

  return {
    currentLog,
    previousWeight,
    formData,
    // Данные макросов берутся в округленном виде из общего хука расчетов
    currentProteins: roundedStats.p,
    currentFats: roundedStats.f,
    currentCarbs: roundedStats.c,
    chartData,
    targetCalories,
    currentCalories,
    calProgress,
    isToday,
    hasLog,
  };
};
