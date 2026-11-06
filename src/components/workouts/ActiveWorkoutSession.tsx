"use client";

import { useState, useEffect, useMemo } from "react";
import { Trash2, PlusCircle, CheckCircle, Play, Info, X } from "lucide-react";
import { toast } from "sonner";
import ExercisesCatalog from "@/components/workouts/ExercisesCatalog";
import { ActiveWorkoutSessionProps } from "@/types/workout";

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}

const playBeepSignal = (
  frequency: number = 800,
  duration: number = 0.15,
): void => {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;

    if (!AudioContextClass) return;

    const ctx: AudioContext = new AudioContextClass();
    const osc: OscillatorNode = ctx.createOscillator();
    const gain: GainNode = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);

    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration);

    // Автоматически уничтожаем контекст после завершения проигрывания скрипта
    setTimeout(
      () => {
        ctx.close();
      },
      (duration + 0.1) * 1000,
    );
  } catch (e) {
    console.error("Не удалось воспроизвести аудио-сигнал:", e);
  }
};

// Расширяем ваши типы пропсом userWeight, который мы передаем из метаданных страницы
interface EnhancedActiveWorkoutProps extends ActiveWorkoutSessionProps {
  userWeight: number;
}

export default function ActiveWorkoutSession({
  customWorkoutName,
  selectedExercises,
  totalVolumeLoad,
  userWeight,
  updateSetValues,
  addSetToExercise,
  removeExerciseFromWorkout,
  addExerciseToWorkout,
  finishActiveWorkout,
  cancelWorkout,
  updateRestTime,
}: EnhancedActiveWorkoutProps) {
  // Флаг запуска тренировки: теперь по умолчанию false
  const [isTimerStarted, setIsTimerStarted] = useState<boolean>(false);
  const [secondsElapsed, setSecondsElapsed] = useState<number>(0);
  const [restTimeLeft, setRestTimeLeft] = useState<number | null>(null);
  const [isCatalogOpen, setIsCatalogOpen] = useState<boolean>(false);

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

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleToggleSetDone = (
    exIndex: number,
    setIndex: number,
    currentDone: boolean,
  ) => {
    if (!isTimerStarted) {
      toast.error("Сначала запустите тренировку кнопкой «Старт» сверху!");
      return;
    }

    const nextDoneState = !currentDone;
    updateSetValues(exIndex, setIndex, "done", nextDoneState);

    // Запускаем таймер, только если сет отметили как выполненный
    if (nextDoneState) {
      const exercise = selectedExercises[exIndex];
      // Берем настроенный rest_time из упражнения, либо фолбек на 90 секунд
      const targetRest = exercise?.rest_time || 90;
      setRestTimeLeft(targetRest);
    }
  };

  const handleFinish = () => {
    const hasActiveSets = selectedExercises.some((ex) =>
      ex.sets.some((s) => s.done),
    );
    if (selectedExercises.length === 0 || !hasActiveSets) {
      toast.error("Отметьте хотя бы один выполненный подход галочкой!");
      return;
    }
    const finalMinutes = Math.round(secondsElapsed / 60) || 1;
    finishActiveWorkout(finalMinutes);
  };
  return (
    <div className="space-y-6 text-left relative pb-12">
      {/* ТАЙМЕР ОТДЫХА */}
      {restTimeLeft !== null && isTimerStarted && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-950/95 backdrop-blur-md text-white px-6 py-4 rounded-3xl shadow-2xl z-50 flex items-center gap-4 border border-slate-800 animate-in slide-in-from-bottom duration-300 w-[92%] max-w-sm">
          <div className="flex flex-col text-left justify-center flex-1">
            <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400 mb-0.5">
              Время отдыха
            </span>
            <span className="text-2xl font-black tabular-nums tracking-tight">
              {Math.floor(restTimeLeft / 60)}:
              {(restTimeLeft % 60).toString().padStart(2, "0")}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                setRestTimeLeft((p) => (p !== null ? p + 30 : null))
              }
              className="px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-black uppercase tracking-wider rounded-xl transition-colors active:scale-95"
            >
              +30с
            </button>
            <button
              onClick={() => setRestTimeLeft(null)}
              className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md shadow-emerald-900/20 active:scale-95"
            >
              Пропустить
            </button>
          </div>
        </div>
      )}

      {/* Условный рендеринг верхней панели: Подготовка vs Активный режим */}
      {!isTimerStarted ? (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 rounded-[32px] shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1.5">
            <span className="px-2.5 py-0.5 bg-white/20 text-white text-[9px] font-black uppercase tracking-widest rounded-md inline-flex items-center gap-1">
              <Info size={10} /> Режим подготовки
            </span>
            <h3 className="text-2xl font-black uppercase tracking-tight">
              {customWorkoutName || "Новый комплекс"}
            </h3>
            <p className="text-xs text-blue-100 font-medium">
              Проверьте состав упражнений, настройте стартовые веса и нажмите
              кнопку старта для активации таймеров.
            </p>
          </div>
          <button
            onClick={() => setIsTimerStarted(true)}
            className="h-14 px-8 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest flex items-center gap-3 transition-all transform hover:scale-[1.02] shadow-lg shadow-emerald-900/20 w-full md:w-auto justify-center shrink-0 border-b-4 border-emerald-700 active:border-b-0 active:mt-1"
          >
            <Play size={16} fill="currentColor" /> Начать тренировку
          </button>
        </div>
      ) : (
        /* Закрепленные панели статистики */
        <div className="sticky top-0 bg-slate-50 pt-2 pb-4 z-40 grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-slate-200/50">
          <div className="bg-slate-900 text-white p-4 rounded-2xl flex flex-col justify-center shadow-md">
            <span className="text-[9px] font-black uppercase tracking-widest text-blue-400">
              Текущий объём
            </span>
            <div className="text-3xl font-black italic mt-0.5 text-blue-400">
              {totalVolumeLoad}{" "}
              <span className="text-xs not-italic text-slate-400">кг</span>
            </div>
          </div>

          <div className="bg-slate-900 text-white p-4 rounded-2xl flex flex-col justify-center shadow-md">
            <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400">
              Энергорасход
            </span>
            <div className="text-3xl font-black italic mt-0.5 text-emerald-400">
              {liveBurnedCalories}{" "}
              <span className="text-xs not-italic text-slate-400">ккал</span>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl flex flex-col justify-center shadow-sm">
            <span className="text-[9px] font-black uppercase tracking-widest text-blue-600">
              Время тренировки
            </span>
            <div className="text-3xl font-black italic mt-0.5 text-blue-700 tracking-wider">
              {formatTime(secondsElapsed)}
            </div>
          </div>
        </div>
      )}

      {/* Вспомогательный статус-бар, если тренировка уже тикает */}
      {isTimerStarted && (
        <div className="pt-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-red-500 block animate-pulse">
            • ТРЕНИРОВКА В ПРОЦЕССЕ
          </span>
          <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">
            {customWorkoutName || "Активный комплекс"}
          </h2>
        </div>
      )}

      {/* Список упражнений */}
      <div className="space-y-4">
        {selectedExercises.map((ex, exIndex) => (
          <div
            key={exIndex}
            className="bg-white p-5 rounded-3xl border border-slate-100 space-y-4 shadow-sm"
          >
            <div className="flex justify-between items-center">
              <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight">
                {exIndex + 1}. {ex.title}
              </h4>
              <button
                onClick={() => removeExerciseFromWorkout(exIndex)}
                className="text-slate-300 hover:text-red-500 transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>

            {/* Рендерим видео, только если оно привязано к упражнению */}
            {ex.video_url && (
              <div className="w-full aspect-video rounded-2xl overflow-hidden bg-slate-900 border border-slate-100 shadow-inner relative group">
                <video
                  src={ex.video_url}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-2 right-2 bg-slate-900/60 backdrop-blur-md text-[10px] font-black uppercase tracking-widest text-white px-2.5 py-1 rounded-lg">
                  Техника выполнения
                </span>
              </div>
            )}

            {/*  Индивидуальная настройка времени отдыха */}
            <div className="flex items-center justify-between bg-slate-50 p-3 rounded-2xl border border-slate-100/70">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Отдых после подходов:
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() =>
                    updateRestTime(exIndex, (ex.rest_time || 90) - 15)
                  }
                  className="w-8 h-8 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl flex items-center justify-center hover:bg-slate-100 transition-colors active:scale-90"
                >
                  -15с
                </button>
                <span className="text-xs font-black text-slate-800 min-w-[55px] text-center tabular-nums">
                  {Math.floor((ex.rest_time || 90) / 60)}м{" "}
                  {(ex.rest_time || 90) % 60}с
                </span>
                <button
                  onClick={() =>
                    updateRestTime(exIndex, (ex.rest_time || 90) + 15)
                  }
                  className="w-8 h-8 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl flex items-center justify-center hover:bg-slate-100 transition-colors active:scale-90"
                >
                  +15с
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="grid grid-cols-4 text-[10px] font-black uppercase tracking-wider text-slate-400 text-center px-2">
                <span>Сет</span>
                <span>Вес (кг)</span>
                <span>Повторы</span>
                <span>Готово</span>
              </div>
              {ex.sets.map((set, setIndex: number) => (
                <div
                  key={setIndex}
                  className={`grid grid-cols-4 gap-2 items-center text-center p-1 rounded-xl transition-colors ${
                    set.done ? "bg-emerald-50/50" : ""
                  }`}
                >
                  <span className="font-black text-slate-400 text-xs">
                    #{setIndex + 1}
                  </span>
                  <input
                    type="number"
                    inputMode="decimal"
                    value={set.weight}
                    onChange={(e) =>
                      updateSetValues(
                        exIndex,
                        setIndex,
                        "weight",
                        e.target.value,
                      )
                    }
                    className="bg-slate-50 border p-2 rounded-xl text-center font-bold outline-none focus:border-blue-500 text-sm"
                  />
                  <input
                    type="number"
                    inputMode="numeric"
                    value={set.reps}
                    onChange={(e) =>
                      updateSetValues(exIndex, setIndex, "reps", e.target.value)
                    }
                    className="bg-slate-50 border p-2 rounded-xl text-center font-bold outline-none focus:border-blue-500 text-sm"
                  />
                  <button
                    onClick={() =>
                      handleToggleSetDone(exIndex, setIndex, set.done)
                    }
                    className={`mx-auto p-2 rounded-xl border-2 transition-all ${
                      set.done
                        ? "bg-emerald-500 border-emerald-500 text-white scale-105"
                        : "border-slate-200 text-transparent"
                    }`}
                  >
                    <CheckCircle
                      size={14}
                      className={set.done ? "text-white" : "text-slate-200"}
                    />
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={() => addSetToExercise(exIndex)}
              className="w-full py-2 bg-slate-50 hover:bg-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 transition-colors flex items-center justify-center gap-1.5"
            >
              <PlusCircle size={12} /> Добавить подход
            </button>
          </div>
        ))}
      </div>

      {/* КНОПКА ВЫЗОВА КАТАЛОГА УПРАЖНЕНИЙ */}
      <div className="pt-2">
        <button
          onClick={() => setIsCatalogOpen(true)}
          className="w-full py-4 bg-slate-50 hover:bg-slate-100 border-2 border-dashed border-slate-200 hover:border-slate-300 text-slate-500 hover:text-slate-750 rounded-2xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
        >
          <PlusCircle size={16} /> Добавить внеплановое упражнение
        </button>
      </div>

      {/* ВСПЛЫВАЮЩИЙ КАТАЛОГ  */}
      {isCatalogOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-slate-50 w-full max-w-2xl rounded-t-[32px] sm:rounded-[32px] shadow-2xl overflow-hidden max-h-[85vh] sm:max-h-[90vh] flex flex-col animate-in slide-in-from-bottom duration-300 text-left">
            {/* Шапка модального окна */}
            <div className="p-5 bg-white border-b border-slate-100 flex justify-between items-center shrink-0">
              <div>
                <h3 className="text-lg font-black text-slate-950 uppercase tracking-tight">
                  Каталог упражнений
                </h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                  Выберите движения для добавления в текущую сессию
                </p>
              </div>
              <button
                onClick={() => setIsCatalogOpen(false)}
                className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-xl transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Контент каталога со скроллом */}
            <div className="overflow-y-auto p-5 space-y-4 class-scroll-clean">
              <ExercisesCatalog
                onSelectExercise={(ex) => {
                  addExerciseToWorkout(ex);
                  setIsCatalogOpen(false); // Автоматически закрываем каталог после добавления
                  toast.success(`Упражнение "${ex.title}" добавлено!`);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Панель управления действиями */}
      <div className="flex gap-3 pt-4">
        <button
          onClick={() => {
            if (
              window.confirm(
                "Прервать тренировку? Текущие данные не будут сохранены.",
              )
            ) {
              cancelWorkout();
            }
          }}
          className="w-1/3 h-14 bg-gray-100 text-gray-700 font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-red-50 hover:text-red-600 transition-all"
        >
          Прервать
        </button>
        <button
          onClick={handleFinish}
          disabled={!isTimerStarted}
          className={`w-2/3 h-14 font-black text-xs uppercase tracking-widest rounded-2xl transition-all shadow-lg border-b-4 ${
            isTimerStarted
              ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-100 border-emerald-800 active:border-b-0 active:mt-1 cursor-pointer"
              : "bg-slate-200 text-slate-400 border-slate-300 cursor-not-allowed shadow-none"
          }`}
        >
          Завершить тренировку 🏁
        </button>
      </div>
    </div>
  );
}
