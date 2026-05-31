import { useMemo } from "react";
import { Log, FormDataType } from "./types";
import { SavedMeal } from "@/types/food";
import { UserProfile } from "@/types/user";
import { useNutritionStats } from "../use-nutrition-stats";
import { getPreviousWeight } from "@/lib/utils/weight-utils";
import { ACTIVITIES_MAP } from "@/constants/activities";

export const useDashboardCalculations = (
  history: Log[],
  profile: UserProfile | null,
  meals: SavedMeal[],
  selectedDate: string,
  userInput: Record<string, string | number>,
  serverToday: string,
) => {
  // 1. Базовые целевые калории из профиля (константа из онбординга)
  const baseTargetCalories = useMemo(
    () => profile?.daily_calories || 2000,
    [profile],
  );

  // 2. Находим текущий лог в истории для выбранной даты
  const currentLog = useMemo(
    () => history.find((l) => l.log_date === selectedDate),
    [history, selectedDate],
  );

  // 3. Сбор параметров активности (Черновик пользователя > Запись из БД)
  const selectedActivityId = useMemo(
    () =>
      (
        userInput.selected_activity_id ??
        currentLog?.selected_activity_id ??
        ""
      ).toString(),
    [userInput.selected_activity_id, currentLog?.selected_activity_id],
  );

  const durationMin = useMemo(
    () =>
      Number(userInput.activity_duration ?? currentLog?.activity_duration ?? 0),
    [userInput.activity_duration, currentLog?.activity_duration],
  );

  const burnedCalories = useMemo(() => {
    if (
      !selectedActivityId ||
      durationMin <= 0 ||
      !ACTIVITIES_MAP[selectedActivityId]
    ) {
      return 0;
    }

    const met = ACTIVITIES_MAP[selectedActivityId].met;
    const weight = profile?.weight || 70;
    const gender = profile?.gender || "female";

    const genderFactor = gender === "female" ? 0.014 : 0.015;
    return Math.round(met * genderFactor * weight * durationMin);
  }, [selectedActivityId, durationMin, profile]);

  // 5. ДИНАМИЧЕСКАЯ ЦЕЛАЯ ЦЕЛЬ: Складываем константу онбординга и траты тренировки!
  const targetCalories = useMemo(() => {
    return baseTargetCalories + burnedCalories;
  }, [baseTargetCalories, burnedCalories]);

  // 6. Передаем новую увеличенную цель в хук подсчета съеденной еды (шкала прогресса пересчитается сама!)
  const { roundedStats } = useNutritionStats(
    meals,
    selectedDate,
    targetCalories,
  );

  // 7. Поиск предыдущего записанного веса
  const previousWeight = useMemo(() => {
    return getPreviousWeight(history, selectedDate);
  }, [history, selectedDate]);

  // 8. Формирование данных для формы ввода
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
      calories: (currentLog?.calories ?? "0").toString(),
      selected_activity_id: selectedActivityId,
      activity_duration: durationMin > 0 ? durationMin.toString() : "",
    };
  }, [userInput, currentLog, selectedActivityId, durationMin]);

  // 9. Итоговые калории из еды
  const currentCalories = useMemo(() => {
    const kcal =
      roundedStats.kcal > 0
        ? roundedStats.kcal
        : parseInt(formData.calories) || 0;
    return Math.round(kcal);
  }, [roundedStats.kcal, formData.calories]);

  // 10. Прогресс для шкалы (считается от НОВОЙ СУММАРНОЙ цели)
  const calProgress = useMemo(() => {
    if (!targetCalories || targetCalories <= 0) return 0;
    return Math.min((currentCalories / targetCalories) * 100, 100);
  }, [currentCalories, targetCalories]);

  // 11. Подготовка исторических данных для графиков
  const chartData = useMemo(() => {
    const sorted = [...history]
      .sort((a, b) => a.log_date.localeCompare(b.log_date))
      .slice(-7);

    return {
      steps: sorted.map((l) => ({ x: l.log_date, y: l.steps || 0 })),
      calories: sorted.map((l) => ({ x: l.log_date, y: l.calories || 0 })),
    };
  }, [history]);

  const isToday = useMemo(
    () => selectedDate === serverToday,
    [selectedDate, serverToday],
  );
  const hasLog = useMemo(() => !!currentLog, [currentLog]);

  return {
    currentLog,
    previousWeight,
    formData,
    currentProteins: roundedStats.p,
    currentFats: roundedStats.f,
    currentCarbs: roundedStats.c,
    burnedCalories, // Отдаем чистый расход наружу для плашек "+350 ккал"
    chartData,
    targetCalories, // Отдаем суммированную цель (Константа + Тренировка) наружу во все баннеры!
    currentCalories,
    calProgress,
    isToday,
    hasLog,
  };
};
