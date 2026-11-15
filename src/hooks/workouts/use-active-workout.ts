import { useState, useEffect, useMemo, useRef } from "react";
import { toast } from "sonner";
import { playBeepSignal } from "@/lib/utils/beep-signal";
import { formatTime } from "@/lib/utils/format-number";
import { useActiveWorkoutStore } from "@/store/useActiveWorkoutStore";
import { useFinishWorkout } from "@/hooks/workouts/use-finish-workout";

interface UseActiveWorkoutProps {
  userWeight: number;
}

export const useActiveWorkout = ({ userWeight }: UseActiveWorkoutProps) => {
  const { finishActiveWorkout } = useFinishWorkout();
  const {
    customWorkoutName,
    selectedExercises,
    isTimerStarted,
    startedAt,
    restEndTime,
    startTimer,
    minimizeWorkout,
    resetWorkoutSession,
    addExercise,
    removeExercise,
    addSet,
    updateSet,
    updateRestTime,
    setRestTimer,
    addRestSeconds,
  } = useActiveWorkoutStore();

  const [isCatalogOpen, setIsCatalogOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const isSubmittingRef = useRef<boolean>(false);

  // Локальный тикер для обновления UI раз в секунду
  const [now, setNow] = useState<number>(() => Date.now());

  // 1. Живой тикер секундомера и таймера отдыха (опирается на Date.now(), не сбивается при сворачивании)
  useEffect(() => {
    if (!isTimerStarted && !restEndTime) return;

    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, [isTimerStarted, restEndTime]);

  // Вычисляем прошедшие секунды тренировки
  const secondsElapsed = useMemo(() => {
    if (!isTimerStarted || !startedAt) return 0;
    return Math.max(0, Math.floor((now - startedAt) / 1000));
  }, [isTimerStarted, startedAt, now]);

  // Вычисляем оставшиеся секунды отдыха
  const restTimeLeft = useMemo(() => {
    if (!restEndTime) return null;
    return Math.ceil((restEndTime - now) / 1000);
  }, [restEndTime, now]);

  // 2. Тройной писк и сброс при окончании отдыха
  useEffect(() => {
    if (restTimeLeft === null) return;

    if (restTimeLeft <= 0) {
      setRestTimer(null);
      playBeepSignal(800, 0.15);
      setTimeout(() => playBeepSignal(800, 0.15), 250);
      setTimeout(() => playBeepSignal(800, 0.15), 500);
    }
  }, [restTimeLeft, setRestTimer]);

  // 3. Живой подсчет тоннажа (объема)
  const totalVolumeLoad = useMemo(() => {
    return selectedExercises.reduce((totalEx, ex) => {
      const exVolume = ex.sets.reduce((totalSet, set) => {
        const w = parseFloat(set.weight) || 0;
        const r = parseInt(set.reps) || 0;
        return totalSet + (set.done ? w * r : 0);
      }, 0);
      return totalEx + exVolume;
    }, 0);
  }, [selectedExercises]);

  // 4. Живой подсчет калорий на основе MET, веса и реального времени
  const liveBurnedCalories = useMemo(() => {
    if (selectedExercises.length === 0 || secondsElapsed <= 0) return 0;
    const avgMet =
      selectedExercises.reduce((sum, ex) => sum + (ex.met || 4.0), 0) /
      selectedExercises.length;
    const durationInMinutes = secondsElapsed / 60;
    const caloriesPerMinute = avgMet * 3.5 * (userWeight / 200);
    return Math.round(caloriesPerMinute * durationInMinutes);
  }, [selectedExercises, secondsElapsed, userWeight]);

  // Форматированное время для UI
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
    updateSet(exIndex, setIndex, "done", nextDoneState);

    if (nextDoneState) {
      const exercise = selectedExercises[exIndex];
      const targetRest = exercise?.rest_time || 90;
      setRestTimer(targetRest);
    }
  };

  // Обработчик старта таймера (сразу синхронизируем now, чтобы не было скачка)
  const handleStartTimer = () => {
    setNow(Date.now());
    startTimer();
  };

  // Обработчик завершения тренировки с защитой от двойного клика
  const handleFinish = async () => {
    if (isSubmittingRef.current) return;

    const hasActiveSets = selectedExercises.some((ex) =>
      ex.sets.some((s) => s.done),
    );
    if (selectedExercises.length === 0 || !hasActiveSets) {
      toast.error("Отметьте хотя бы один выполненный подход галочкой!");
      return;
    }

    isSubmittingRef.current = true;
    setIsSubmitting(true);

    try {
      const finalMinutes = Math.round(secondsElapsed / 60) || 1;
      await finishActiveWorkout(finalMinutes);
      resetWorkoutSession();
    } catch {
      // Ошибка уже показана пользователю в useFinishWorkout
    } finally {
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  return {
    customWorkoutName,
    selectedExercises,
    isTimerStarted,
    handleStartTimer,
    minimizeWorkout,
    cancelWorkout: resetWorkoutSession,
    restTimeLeft,
    addRestSeconds,
    skipRest: () => setRestTimer(null),
    isCatalogOpen,
    setIsCatalogOpen,
    totalVolumeLoad,
    liveBurnedCalories,
    formattedTime,
    addExercise,
    removeExercise,
    addSet,
    updateSet,
    updateRestTime,
    handleToggleSetDone,
    handleFinish,
    isSubmitting,
  };
};
