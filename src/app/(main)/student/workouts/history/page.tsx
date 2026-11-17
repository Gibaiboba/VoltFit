"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Flame,
  Dumbbell,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Trash2,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useUserStore } from "@/store/useUserStore";
import { useActiveWorkoutStore } from "@/store/useActiveWorkoutStore";
import { WorkoutExercise } from "@/types/workout";

interface WorkoutLogRecord {
  id: string;
  user_id: string;
  name: string;
  exercises: WorkoutExercise[];
  duration: number;
  burned_calories: number;
  total_volume: number;
  created_at: string;
}

export default function WorkoutHistoryPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const userId = useUserStore((state) => state.user?.id);
  const startWorkoutSession = useActiveWorkoutStore(
    (state) => state.startWorkoutSession,
  );

  const [expandedId, setExpandedId] = useState<string | null>(null);

  // 1. Загружаем историю тренировок из workout_logs
  const { data: logs = [], isLoading } = useQuery<WorkoutLogRecord[]>({
    queryKey: ["workout-logs", userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from("workout_logs")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data as WorkoutLogRecord[]) || [];
    },
    enabled: !!userId,
  });

  // 2. Синхронное удаление из workout_logs и из дневника daily_logs
  const { mutate: deleteLog } = useMutation({
    mutationFn: async (logId: string) => {
      if (!userId) throw new Error("Пользователь не авторизован");

      // Шаг А: Удаляем детальную запись из истории тренировок
      const { error: workoutError } = await supabase
        .from("workout_logs")
        .delete()
        .eq("id", logId);

      if (workoutError) throw workoutError;

      // Шаг Б: Ищем день в daily_logs, где в массиве activities есть этот workout_log_id
      const { data: matchingDailyLogs, error: fetchError } = await supabase
        .from("daily_logs")
        .select("id, activities")
        .eq("user_id", userId)
        .contains("activities", JSON.stringify([{ workout_log_id: logId }]));

      if (fetchError) throw fetchError;

      // Шаг В: Убираем тренировку из массива и пересчитываем калории за день
      if (matchingDailyLogs && matchingDailyLogs.length > 0) {
        for (const dailyLog of matchingDailyLogs) {
          const currentActivities = Array.isArray(dailyLog.activities)
            ? dailyLog.activities
            : [];

          const updatedActivities = currentActivities.filter(
            (act: { workout_log_id?: string }) => act.workout_log_id !== logId,
          );

          const updatedBurnedCalories = updatedActivities.reduce(
            (sum: number, act: { burned_calories?: number }) =>
              sum + (Number(act.burned_calories) || 0),
            0,
          );

          const { error: updateError } = await supabase
            .from("daily_logs")
            .update({
              activities: updatedActivities,
              burned_calories: updatedBurnedCalories,
            })
            .eq("id", dailyLog.id);

          if (updateError) throw updateError;
        }
      }
    },
    onSuccess: () => {
      toast.success("Тренировка удалена из истории и дневника");
      // Обновляем кэш истории тренировок, трекера и дневника
      queryClient.invalidateQueries({ queryKey: ["workout-logs", userId] });
      queryClient.invalidateQueries({
        queryKey: ["student-logs-range", userId],
      });
      queryClient.invalidateQueries({
        queryKey: ["student-logs-infinite", userId],
      });
    },
    onError: () => {
      toast.error("Не удалось удалить тренировку");
    },
  });

  // Повтор прошлой тренировки
  const handleRepeatWorkout = (log: WorkoutLogRecord) => {
    const preparedExercises = (log.exercises || []).map((ex) => ({
      ...ex,
      sets: (ex.sets || []).map((s) => ({ ...s, done: false })),
    }));
    startWorkoutSession(log.name, preparedExercises);
    router.push("/student/workouts");
  };

  const formatLogDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 min-h-[calc(100vh-64px)] mt-16 text-slate-900 space-y-6">
      {/* Шапка страницы */}
      <div className="flex items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/student/workouts"
            className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors shrink-0"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-xl sm:text-3xl font-black uppercase tracking-tight text-slate-900">
              История тренировок
            </h1>
            <p className="text-xs font-medium text-slate-400">
              Всего выполнено сессий: {logs.length}
            </p>
          </div>
        </div>
      </div>
      {/* Список выполненных тренировок */}
      {isLoading ? (
        <div className="p-12 text-center text-xs font-black uppercase tracking-widest text-slate-400 animate-pulse">
          Загрузка журнала тренировок...
        </div>
      ) : logs.length === 0 ? (
        <div className="bg-white p-12 rounded-[32px] border border-slate-100 text-center space-y-3">
          <Dumbbell className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="text-sm font-bold text-slate-500">
            У вас пока нет завершённых тренировок
          </p>
          <Link
            href="/student/workouts"
            className="inline-block px-5 py-2.5 bg-slate-900 text-white text-xs font-black uppercase tracking-wider rounded-xl"
          >
            Перейти к тренировкам
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {logs.map((log) => {
            const isExpanded = expandedId === log.id;

            return (
              <div
                key={log.id}
                className="bg-white rounded-[28px] border border-slate-100 shadow-sm overflow-hidden transition-all"
              >
                {/* Основная карточка */}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => setExpandedId(isExpanded ? null : log.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      setExpandedId(isExpanded ? null : log.id);
                    }
                  }}
                  className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/50 transition-colors"
                >
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400">
                      <Calendar size={12} />
                      <span>{formatLogDate(log.created_at)}</span>
                    </div>

                    <h3 className="text-lg sm:text-xl font-black text-slate-900 uppercase tracking-tight break-words">
                      {log.name || "Тренировка"}
                    </h3>

                    {/* Метрики */}
                    <div className="flex flex-wrap items-center gap-3 pt-1 text-xs font-bold">
                      <span className="inline-flex items-center gap-1 text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
                        <Clock size={12} /> {log.duration} мин
                      </span>
                      <span className="inline-flex items-center gap-1 text-orange-600 bg-orange-50 px-2.5 py-1 rounded-lg">
                        <Flame size={12} /> {log.burned_calories} ккал
                      </span>
                      {log.total_volume > 0 && (
                        <span className="inline-flex items-center gap-1 text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                          <Dumbbell size={12} /> {log.total_volume} кг
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                    <span className="text-xs font-bold text-slate-400 sm:hidden">
                      {isExpanded ? "Скрыть детали" : "Смотреть подходы"}
                    </span>
                    <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
                      {isExpanded ? (
                        <ChevronUp size={18} />
                      ) : (
                        <ChevronDown size={18} />
                      )}
                    </div>
                  </div>
                </div>

                {/* Раскрывающийся блок с упражнениями и подходами */}
                {isExpanded && (
                  <div className="px-5 sm:px-6 pb-6 pt-2 border-t border-slate-100 bg-slate-50/40 space-y-4">
                    <div className="space-y-3">
                      {(log.exercises || []).map((ex, idx) => (
                        <div
                          key={idx}
                          className="bg-white p-3.5 rounded-2xl border border-slate-100 space-y-2"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs sm:text-sm font-black text-slate-800">
                              {idx + 1}. {ex.title}
                            </span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase">
                              Отдых: {ex.rest_time || 90} сек
                            </span>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {(ex.sets || []).map((set, sIdx) => (
                              <div
                                key={sIdx}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center justify-between border ${
                                  set.done
                                    ? "bg-emerald-50/60 border-emerald-200 text-emerald-900"
                                    : "bg-slate-50 border-slate-100 text-slate-400"
                                }`}
                              >
                                <span>
                                  #{sIdx + 1}: {set.weight || 0} кг × {set.reps}
                                </span>
                                {set.done && (
                                  <CheckCircle2
                                    size={12}
                                    className="text-emerald-600 shrink-0"
                                  />
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Кнопки действий внизу карточки */}
                    <div className="flex items-center justify-between gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => handleRepeatWorkout(log)}
                        className="px-4 py-2.5 bg-slate-900 hover:bg-blue-600 text-white text-xs font-black uppercase tracking-wider rounded-xl inline-flex items-center gap-2 transition-colors cursor-pointer"
                      >
                        <RotateCcw size={14} /> Повторить тренировку
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (
                            window.confirm(
                              "Удалить эту тренировку? Она также исчезнет из дневника и пересчитает калории за день.",
                            )
                          ) {
                            deleteLog(log.id);
                          }
                        }}
                        className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                        title="Удалить из истории и дневника"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
