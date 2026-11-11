import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { playBeepSignal } from "@/lib/utils/beep-signal";
import { formatTime } from "@/lib/utils/format-number";
import { ActiveWorkoutSessionProps } from "@/types/workout";

interface UseActiveWorkoutProps extends Pick<
  ActiveWorkoutSessionProps,
  "selectedExercises" | "updateSetValues" | "finishActiveWorkout"
> {
  userWeight: number;
}

export const useActiveWorkout = ({
  selectedExercises,
  userWeight,
  finishActiveWorkout,
  updateSetValues,
}: UseActiveWorkoutProps) => {
  const [isTimerStarted, setIsTimerStarted] = useState<boolean>(false);
  const [secondsElapsed, setSecondsElapsed] = useState<number>(0);
  const [restTimeLeft, setRestTimeLeft] = useState<number | null>(null);
  const [isCatalogOpen, setIsCatalogOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Секундомер тренировки: тикает ТОЛЬКО если тренировка запущена
  useEffect(() => {
    if (!isTimerStarted) return;
    const mainTimer = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(mainTimer);
  }, [isTimerStarted]);

  // Тройной писк при окончании отдыха
  useEffect(() => {
    if (restTimeLeft === null) return;
    if (restTimeLeft <= 0) {
      setTimeout(() => {
        setRestTimeLeft(null);
      }, 0);

      // Воспроизводим 3 быстрых сигнала
      playBeepSignal(800, 0.15);
      setTimeout(() => playBeepSignal(800, 0.15), 250);
      setTimeout(() => playBeepSignal(800, 0.15), 500);
      return;
    }
    const interval = setInterval(() => {
      setRestTimeLeft((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);
    return () => clearInterval(interval);
  }, [restTimeLeft]);

  // Живой подсчет калорий на основе MET, веса и прошедшего времени
  const liveBurnedCalories = useMemo(() => {
    if (selectedExercises.length === 0 || secondsElapsed <= 0) return 0;
    const avgMet =
      selectedExercises.reduce((sum, ex) => sum + (ex.met || 4.0), 0) /
      selectedExercises.length;
    const durationInMinutes = secondsElapsed / 60;
    const caloriesPerMinute = avgMet * 3.5 * (userWeight / 200);
    return Math.round(caloriesPerMinute * durationInMinutes);
  }, [selectedExercises, secondsElapsed, userWeight]);

  // Форматированное время для удобного вывода в UI
  const formattedTime = useMemo(
    () => formatTime(secondsElapsed),
    [secondsElapsed],
  );

  // Обработчик переключения готовности сета
  const handleToggleSetDone = (
    exIndex: number,
    setIndex: number,
    currentDone: boolean,
  ) => {
    if (!isTimerStarted) {
      toast.error("Сначала запустите тренировку кнопкой Старт сверху!");
      return;
    }
    const nextDoneState = !currentDone;
    updateSetValues(exIndex, setIndex, "done", nextDoneState);

    // Запускаем таймер отдыха, только если сет отметили как выполненный
    if (nextDoneState) {
      const exercise = selectedExercises[exIndex];
      const targetRest = exercise?.rest_time || 90;
      setRestTimeLeft(targetRest);
    }
  };

  // Обработчик завершения тренировки
  const handleFinish = async () => {
    // 1. Мгновенная блокировка от повторного вызова
    if (isSubmitting) return;

    const hasActiveSets = selectedExercises.some((ex) =>
      ex.sets.some((s) => s.done),
    );
    if (selectedExercises.length === 0 || !hasActiveSets) {
      toast.error("Отметьте хотя бы один выполненный подход галочкой!");
      return;
    }

    setIsSubmitting(true); // Блокируем кнопку
    setIsTimerStarted(false); // Сразу останавливаем секундомер

    try {
      const finalMinutes = Math.round(secondsElapsed / 60) || 1;
      await finishActiveWorkout(finalMinutes);
    } finally {
      setIsSubmitting(false); // Разблокируем после завершения (на случай ошибки сети)
    }
  };

  return {
    isTimerStarted,
    setIsTimerStarted,
    secondsElapsed,
    setSecondsElapsed,
    restTimeLeft,
    setRestTimeLeft,
    isCatalogOpen,
    setIsCatalogOpen,
    liveBurnedCalories,
    formattedTime,
    handleToggleSetDone,
    handleFinish,
    isSubmitting,
  };
};
