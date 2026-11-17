"use client";

import { useState } from "react";
import {
  Dumbbell,
  Plus,
  Trash2,
  AlertTriangle,
  Award,
  CheckCircle2,
  FileText,
  Calendar,
  Archive,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Clock,
  Flame,
} from "lucide-react";
import { UserProfile } from "@/types/user";
import { WorkoutTemplate, ExerciseTemplate } from "@/types/workout";
import { EXERCISES_DATABASE } from "@/constants/workout/exerciseData";
import { useWorkoutHistory } from "@/hooks/workouts/use-workout-history";
import { useCoachPrograms } from "@/hooks/coach/use-coach-programs";

interface CoachWorkoutsTabProps {
  student: UserProfile;
}

const LABELS_MAP: Record<string, string> = {
  home: "🏡 Дом",
  gym: "🏋️‍♂️ Тренажёрный зал",
  street: "🌲 Улица",
  mixed: "🔄 Комбинированный",
  bodyweight: "Свой вес",
  bands: "Резинки",
  dumbbells: "Гантели/гири",
  pullup_bar: "Турник/брусья",
  full_gym: "Весь зал",
  beginner: "Новичок",
  intermediate: "Средний",
  advanced: "Продвинутый",
  fullbody: "Всё тело",
  legs: "Ноги и ягодицы",
  back: "Спина и осанка",
  upper: "Верх тела",
  core: "Пресс и кор",
  back_issue: "Спина/поясница",
  knees: "Колени/суставы",
  heart: "Сердце/давление",
  injuries: "Травмы/операции",
  cycle_sensitive: "Чувствительный цикл",
  postpartum: "После родов / диастаз",
};

export function CoachWorkoutsTab({ student }: CoachWorkoutsTabProps) {
  const fitnessAnswers = student.fitness_profile?.answers || {};

  // Состояние конструктора новой программы
  const [isCreating, setIsCreating] = useState(false);
  const [programName, setProgramName] = useState(
    "Персональный план • Неделя 1",
  );
  const [coachNotes, setCoachNotes] = useState("");
  const [workouts, setWorkouts] = useState<WorkoutTemplate[]>([
    { name: "Тренировка А • База", exercises: [] },
  ]);
  const [activeDayPicker, setActiveDayPicker] = useState<number | null>(null);

  // Состояние архива программ и раскрытия логов выполненных тренировок
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  // Чистые хуки без прямых обращений к Supabase в компоненте
  const {
    activeProgram,
    archivedPrograms,
    isLoading,
    assignProgram,
    isSaving,
    toggleProgramStatus,
  } = useCoachPrograms(student.id);

  const { logs: completedLogs, isLoading: isLogsLoading } = useWorkoutHistory(
    student.id,
  );

  // Хелперы конструктора
  const addWorkoutDay = () => {
    setWorkouts((prev) => [
      ...prev,
      { name: `Тренировка ${prev.length + 1}`, exercises: [] },
    ]);
  };

  const addExerciseToDay = (dayIndex: number, ex: ExerciseTemplate) => {
    setWorkouts((prev) =>
      prev.map((day, idx) =>
        idx === dayIndex
          ? {
              ...day,
              exercises: [
                ...day.exercises,
                {
                  id: ex.id,
                  title: ex.title,
                  met: ex.met,
                  video_url: ex.video_url,
                  rest_time: 90,
                  sets: [
                    { reps: "12", weight: "0", done: false },
                    { reps: "12", weight: "0", done: false },
                    { reps: "12", weight: "0", done: false },
                  ],
                },
              ],
            }
          : day,
      ),
    );
    setActiveDayPicker(null);
  };

  const removeExerciseFromDay = (dayIndex: number, exIndex: number) => {
    setWorkouts((prev) =>
      prev.map((day, idx) =>
        idx === dayIndex
          ? {
              ...day,
              exercises: day.exercises.filter((_, i) => i !== exIndex),
            }
          : day,
      ),
    );
  };

  const updateExerciseSetsCount = (
    dayIndex: number,
    exIndex: number,
    count: number,
    reps: string,
  ) => {
    const safeCount = Math.max(1, Math.min(10, count));
    setWorkouts((prev) =>
      prev.map((day, dIdx) =>
        dIdx === dayIndex
          ? {
              ...day,
              exercises: day.exercises.map((ex, eIdx) =>
                eIdx === exIndex
                  ? {
                      ...ex,
                      sets: Array.from({ length: safeCount }, () => ({
                        reps,
                        weight: "0",
                        done: false,
                      })),
                    }
                  : ex,
              ),
            }
          : day,
      ),
    );
  };

  const healthRestrictions = (
    (fitnessAnswers.health_restrictions as string[]) || []
  ).filter((r) => r !== "none");
  const femaleHealth = (
    (fitnessAnswers.female_health as string[]) || []
  ).filter((r) => r !== "none");

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 text-left">
      {/* БЛОК 1. СПОРТИВНАЯ АНКЕТА УЧЕНИКА */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
            <FileText size={16} className="text-blue-600" />
            Спортивная анкета ученика
          </h3>
          {!student.fitness_profile?.completed && (
            <span className="px-2.5 py-1 bg-slate-100 text-slate-500 text-[10px] font-bold rounded-lg">
              Анкета ещё не заполнена
            </span>
          )}
        </div>

        {student.fitness_profile?.completed ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-slate-50 rounded-2xl">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">
                  Локация
                </span>
                <span className="text-xs font-black text-slate-800 mt-0.5 block">
                  {LABELS_MAP[fitnessAnswers.training_place as string] || "—"}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">
                  Опыт
                </span>
                <span className="text-xs font-black text-slate-800 mt-0.5 block">
                  {LABELS_MAP[fitnessAnswers.fitness_experience as string] ||
                    "—"}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">
                  Длительность
                </span>
                <span className="text-xs font-black text-slate-800 mt-0.5 block">
                  {fitnessAnswers.schedule_duration
                    ? `${fitnessAnswers.schedule_duration} мин`
                    : "—"}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">
                  Инвентарь
                </span>
                <span className="text-xs font-black text-slate-800 mt-0.5 block truncate">
                  {((fitnessAnswers.equipment as string[]) || [])
                    .map((eq) => LABELS_MAP[eq] || eq)
                    .join(", ") || "—"}
                </span>
              </div>
            </div>

            {(healthRestrictions.length > 0 || femaleHealth.length > 0) && (
              <div className="p-3.5 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-2.5">
                <AlertTriangle
                  size={16}
                  className="text-red-500 shrink-0 mt-0.5"
                />
                <div className="text-xs text-red-900">
                  <span className="font-black uppercase block mb-0.5">
                    Ограничения и особенности здоровья:
                  </span>
                  <span className="font-semibold">
                    {[...healthRestrictions, ...femaleHealth]
                      .map((item) =>
                        item === "back"
                          ? LABELS_MAP.back_issue
                          : LABELS_MAP[item] || item,
                      )
                      .join(" • ")}
                  </span>
                </div>
              </div>
            )}

            {typeof fitnessAnswers.coach_notes === "string" &&
              fitnessAnswers.coach_notes.trim().length > 0 && (
                <div className="p-3.5 bg-blue-50/60 border border-blue-100 rounded-2xl text-xs text-slate-700">
                  <span className="text-[10px] font-black uppercase text-blue-600 block mb-1">
                    Пожелания ученика:
                  </span>
                  <p className="font-medium leading-relaxed">
                    {fitnessAnswers.coach_notes}
                  </p>
                </div>
              )}
          </div>
        ) : (
          <p className="text-xs text-slate-400">
            Ученик ещё не прошёл стартовый опрос в разделе «Тренировки». Вы всё
            равно можете назначить ему программу вручную.
          </p>
        )}
      </div>
      {/* БЛОК 2. ТЕКУЩАЯ НАЗНАЧЕННАЯ ПРОГРАММА И АРХИВ */}
      {!isCreating && (
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <Award size={16} className="text-amber-500" />
              Назначенная программа
            </h3>

            <button
              type="button"
              onClick={() => setIsCreating(true)}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black uppercase tracking-wider rounded-xl inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Plus size={14} />{" "}
              {activeProgram ? "Заменить программу" : "Назначить программу"}
            </button>
          </div>

          {isLoading ? (
            <p className="text-xs text-slate-400 animate-pulse">
              Загрузка программы...
            </p>
          ) : activeProgram ? (
            <div className="p-4 bg-amber-50/50 border border-amber-200/70 rounded-2xl space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-amber-600">
                    Активна сейчас
                  </span>
                  <h4 className="text-base font-black text-slate-900">
                    {activeProgram.program_name}
                  </h4>
                  {activeProgram.coach_notes && (
                    <p className="text-xs text-slate-600 mt-1">
                      {activeProgram.coach_notes}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (
                      window.confirm(
                        "Перенести эту программу в архив у ученика?",
                      )
                    ) {
                      toggleProgramStatus({
                        programId: activeProgram.id,
                        isActive: false,
                      });
                    }
                  }}
                  className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-100/60 rounded-xl transition-colors cursor-pointer"
                  title="Перенести в архив"
                >
                  <Archive size={16} />
                </button>
              </div>

              <div className="space-y-2 pt-2 border-t border-amber-200/50">
                {activeProgram.workouts?.map((w, i) => (
                  <div
                    key={i}
                    className="bg-white p-3 rounded-xl border border-amber-100 text-xs"
                  >
                    <span className="font-black text-slate-800 block">
                      {w.name}
                    </span>
                    <span className="text-slate-500 mt-0.5 block">
                      {w.exercises
                        ?.map(
                          (e) =>
                            `${e.title} (${e.sets.length}×${e.sets?.[0]?.reps || 12})`,
                        )
                        .join(", ")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-400">
              У ученика пока нет активной программы от тренера (сейчас он
              занимается по авто-подбору).
            </p>
          )}

          {/* Кнопка и список архивных программ */}
          {archivedPrograms.length > 0 && (
            <div className="pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsArchiveOpen((prev) => !prev)}
                className="flex items-center justify-between w-full py-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              >
                <span className="inline-flex items-center gap-1.5">
                  <Archive size={14} className="text-slate-400" />
                  Архив прошлых программ ({archivedPrograms.length})
                </span>
                {isArchiveOpen ? (
                  <ChevronUp size={15} />
                ) : (
                  <ChevronDown size={15} />
                )}
              </button>

              {isArchiveOpen && (
                <div className="space-y-2.5 mt-2">
                  {archivedPrograms.map((arch) => (
                    <div
                      key={arch.id}
                      className="p-3.5 bg-slate-50 border border-slate-200/70 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold text-slate-400 block">
                          {new Date(arch.created_at).toLocaleDateString(
                            "ru-RU",
                          )}
                        </span>
                        <h5 className="text-xs font-black text-slate-800 truncate">
                          {arch.program_name}
                        </h5>
                        <p className="text-[11px] text-slate-500 truncate">
                          {arch.workouts?.map((w) => w.name).join(" • ")}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          toggleProgramStatus({
                            programId: arch.id,
                            isActive: true,
                          })
                        }
                        className="px-3 py-2 bg-white hover:bg-blue-50 text-blue-600 border border-slate-200 rounded-xl text-[11px] font-black uppercase tracking-wider inline-flex items-center justify-center gap-1.5 shrink-0 transition-colors cursor-pointer"
                      >
                        <RotateCcw size={12} /> Сделать активной
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* БЛОК 3. КОНСТРУКТОР НОВОЙ ПРОГРАММЫ ДЛЯ УЧЕНИКА */}
      {isCreating && (
        <div className="bg-white p-5 sm:p-6 rounded-3xl border-2 border-blue-500/20 shadow-md space-y-5 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h3 className="text-base font-black uppercase text-slate-900 flex items-center gap-2">
              <Dumbbell size={18} className="text-blue-600" />
              Новая программа для ученика
            </h3>
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="text-xs font-bold text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              Отмена
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">
                Название программы
              </label>
              <input
                type="text"
                value={programName}
                onChange={(e) => setProgramName(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:border-blue-500 outline-none"
                placeholder="Например: Фулбоди на 3 дня"
              />
            </div>

            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">
                Комментарий / инструкция ученику
              </label>
              <input
                type="text"
                value={coachNotes}
                onChange={(e) => setCoachNotes(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:border-blue-500 outline-none"
                placeholder="Например: Акцент на технику, без работы в отказ"
              />
            </div>
          </div>

          {/* Список тренировочных дней */}
          <div className="space-y-4">
            {workouts.map((day, dayIdx) => (
              <div
                key={dayIdx}
                className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-1">
                    <Calendar size={15} className="text-blue-600 shrink-0" />
                    <input
                      type="text"
                      value={day.name}
                      onChange={(e) =>
                        setWorkouts((prev) =>
                          prev.map((d, i) =>
                            i === dayIdx ? { ...d, name: e.target.value } : d,
                          ),
                        )
                      }
                      className="bg-transparent font-black text-sm text-slate-900 border-b border-transparent focus:border-blue-500 outline-none w-full"
                    />
                  </div>
                  {workouts.length > 1 && (
                    <button
                      type="button"
                      onClick={() =>
                        setWorkouts((prev) =>
                          prev.filter((_, i) => i !== dayIdx),
                        )
                      }
                      className="text-xs text-slate-400 hover:text-red-500 cursor-pointer"
                    >
                      Удалить день
                    </button>
                  )}
                </div>

                {/* Упражнения внутри дня */}
                <div className="space-y-2">
                  {day.exercises.map((ex, exIdx) => (
                    <div
                      key={exIdx}
                      className="bg-white p-3 rounded-xl border border-slate-100 flex flex-wrap sm:flex-nowrap items-center justify-between gap-3"
                    >
                      <span className="text-xs font-bold text-slate-800 flex-1 min-w-[140px]">
                        {ex.title}
                      </span>

                      <div className="flex items-center gap-2 text-xs">
                        <label className="text-slate-400 font-bold">
                          Подх:
                          <input
                            type="number"
                            min={1}
                            max={10}
                            value={ex.sets.length}
                            onChange={(e) =>
                              updateExerciseSetsCount(
                                dayIdx,
                                exIdx,
                                Number(e.target.value),
                                ex.sets?.[0]?.reps || "12",
                              )
                            }
                            className="w-12 ml-1 p-1 bg-slate-50 border border-slate-200 rounded text-center font-black text-slate-800"
                          />
                        </label>

                        <label className="text-slate-400 font-bold">
                          Повт:
                          <input
                            type="text"
                            value={ex.sets?.[0]?.reps || "12"}
                            onChange={(e) =>
                              updateExerciseSetsCount(
                                dayIdx,
                                exIdx,
                                ex.sets.length,
                                e.target.value,
                              )
                            }
                            className="w-14 ml-1 p-1 bg-slate-50 border border-slate-200 rounded text-center font-black text-slate-800"
                          />
                        </label>

                        <button
                          type="button"
                          onClick={() => removeExerciseFromDay(dayIdx, exIdx)}
                          className="p-1.5 text-slate-400 hover:text-red-500 cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Выбор упражнения из каталога */}
                {activeDayPicker === dayIdx ? (
                  <div className="bg-white p-3 rounded-xl border border-blue-200 max-h-48 overflow-y-auto space-y-1">
                    <div className="flex justify-between items-center pb-1 mb-1 border-b border-slate-100">
                      <span className="text-[10px] font-black uppercase text-blue-600">
                        Выберите упражнение:
                      </span>
                      <button
                        type="button"
                        onClick={() => setActiveDayPicker(null)}
                        className="text-xs text-slate-400 hover:text-slate-700 cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>
                    {EXERCISES_DATABASE.map((dbEx) => (
                      <button
                        key={dbEx.id}
                        type="button"
                        onClick={() => addExerciseToDay(dayIdx, dbEx)}
                        className="w-full text-left px-2.5 py-1.5 hover:bg-blue-50 rounded-lg text-xs font-bold text-slate-700 flex justify-between items-center cursor-pointer"
                      >
                        <span>{dbEx.title}</span>
                        <span className="text-[10px] text-slate-400">
                          {dbEx.target_muscle}
                        </span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setActiveDayPicker(dayIdx)}
                    className="w-full py-2.5 border border-dashed border-slate-300 hover:border-blue-400 text-slate-500 hover:text-blue-600 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Plus size={14} /> Добавить упражнение
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="button"
              onClick={addWorkoutDay}
              className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
            >
              + Добавить тренировочный день
            </button>

            <button
              type="button"
              disabled={isSaving}
              onClick={async () => {
                await assignProgram({ programName, coachNotes, workouts });
                setIsCreating(false);
              }}
              className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-100 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <CheckCircle2 size={16} />
              {isSaving ? "Сохраняем..." : "Назначить программу ученику"}
            </button>
          </div>
        </div>
      )}

      {/* БЛОК 4. ВЫПОЛНЕННЫЕ ТРЕНИРОВКИ УЧЕНИКА (ИЗ workout_logs) */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
            <Dumbbell size={16} className="text-emerald-600" />
            Выполненные тренировки ученика
          </h3>
          <span className="text-xs font-bold text-slate-400">
            Всего: {completedLogs.length}
          </span>
        </div>

        {isLogsLoading ? (
          <p className="text-xs text-slate-400 animate-pulse">
            Загрузка истории тренировок...
          </p>
        ) : completedLogs.length === 0 ? (
          <p className="text-xs text-slate-400">
            Ученик ещё не завершил ни одной силовой тренировки в плеере.
          </p>
        ) : (
          <div className="space-y-3">
            {completedLogs.map((log) => {
              const isExpanded = expandedLogId === log.id;

              return (
                <div
                  key={log.id}
                  className="border border-slate-100 rounded-2xl overflow-hidden bg-slate-50/40"
                >
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        setExpandedLogId(isExpanded ? null : log.id);
                      }
                    }}
                    className="p-4 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-slate-50/60 transition-colors"
                  >
                    <div className="space-y-1 min-w-0">
                      <span className="text-[10px] font-bold text-slate-400 block">
                        {new Date(log.created_at).toLocaleDateString("ru-RU", {
                          day: "numeric",
                          month: "long",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      <h4 className="text-sm font-black text-slate-900 uppercase truncate">
                        {log.name || "Тренировка"}
                      </h4>
                      <div className="flex flex-wrap items-center gap-2 pt-0.5 text-[11px] font-bold">
                        <span className="inline-flex items-center gap-1 text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                          <Clock size={11} /> {log.duration} мин
                        </span>
                        <span className="inline-flex items-center gap-1 text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md">
                          <Flame size={11} /> {log.burned_calories} ккал
                        </span>
                        {log.total_volume > 0 && (
                          <span className="inline-flex items-center gap-1 text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                            <Dumbbell size={11} /> {log.total_volume} кг
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      <span className="text-[11px] font-bold text-slate-400">
                        {isExpanded ? "Свернуть" : "Подходы"}
                      </span>
                      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
                        {isExpanded ? (
                          <ChevronUp size={15} />
                        ) : (
                          <ChevronDown size={15} />
                        )}
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="p-4 border-t border-slate-100 space-y-2.5">
                      {(log.exercises || []).map((ex, idx) => (
                        <div
                          key={idx}
                          className="bg-white p-3 rounded-xl border border-slate-100 space-y-2"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-black text-slate-800">
                              {idx + 1}. {ex.title}
                            </span>
                            <span className="text-[10px] font-bold text-slate-400">
                              Отдых: {ex.rest_time || 90} сек
                            </span>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                            {(ex.sets || []).map((set, sIdx) => (
                              <div
                                key={sIdx}
                                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center justify-between border ${
                                  set.done
                                    ? "bg-emerald-50/70 border-emerald-200 text-emerald-900"
                                    : "bg-slate-50 border-slate-100 text-slate-400"
                                }`}
                              >
                                <span>
                                  #{sIdx + 1}: {set.weight || 0} кг × {set.reps}
                                </span>
                                {set.done && (
                                  <CheckCircle2
                                    size={11}
                                    className="text-emerald-600 shrink-0"
                                  />
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
