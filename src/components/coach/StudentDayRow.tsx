"use client";

import { useMemo } from "react";
import { MealCard } from "@/components/history/meal-card";
import { SavedMeal } from "@/types/food";
import { DailyLog } from "@/types/shared";
import { LoggedActivity } from "@/hooks/use-student-dashboard/types";
import { ACTIVITIES_MAP } from "@/constants/activities";
import {
  Footprints,
  Moon,
  Weight,
  Pizza,
  Droplets,
  Dumbbell,
  Flame,
  Target,
} from "lucide-react";

interface StudentDayRowProps {
  date: string;
  log?: DailyLog;
  meals: SavedMeal[];
  baseCalories: number;
  studentWeight: number;
  studentGender: string;
}

export function StudentDayRow({
  date,
  log,
  meals,
  baseCalories,
  studentWeight,
  studentGender,
}: StudentDayRowProps) {
  const displayDate = new Date(date).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    weekday: "short",
  });

  // Суммарные калории, фактически съеденные из добавленной еды
  const totalConsumedKcal = useMemo(() => {
    return meals.reduce((sum, m) => sum + m.total_kcal, 0);
  }, [meals]);

  // пересчет калорий спорта на основе физических параметров самого ученика
  const totalBurnedCalories = useMemo(() => {
    const logActivities = log?.activities || [];
    if (logActivities.length === 0) return 0;

    // Если в конкретный день есть запись веса — берем её, иначе базовый вес из профиля
    const currentWeight = log && log.weight > 0 ? log.weight : studentWeight;
    const genderFactor = studentGender === "female" ? 0.014 : 0.015;

    // Считаем сумму БЕЗ промежуточных округлений каждой сессии для исключения погрешности
    const rawSum = logActivities.reduce((sum, act) => {
      const config = ACTIVITIES_MAP[act.activity_id];
      if (!config || act.duration <= 0) return sum;
      return sum + config.met * genderFactor * currentWeight * act.duration;
    }, 0);

    // Округляем только один раз — финальный итог за сутки
    return Math.round(rawSum);
  }, [log, studentWeight, studentGender]);

  // ДИНАМИЧЕСКИЙ РАСЧЕТ ИТОГОВОЙ ЦЕЛИ НА ДЕНЬ (База + Траты на спорте)
  const dynamicTargetCalories = useMemo(() => {
    return baseCalories + totalBurnedCalories;
  }, [baseCalories, totalBurnedCalories]);

  const renderValue = (value: number | string | undefined | null) => {
    return value ? value : "--";
  };
  return (
    <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden mb-6 animate-in fade-in duration-200">
      {/* Шапка дня с балансом калорий */}
      <div className="bg-slate-50/50 px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <h3 className="font-black text-slate-800 text-sm uppercase tracking-wider">
          {displayDate}
        </h3>

        {/* Вывод итогового калоража за день (Съедено / Цель с учетом тренировок) */}
        <div className="flex flex-wrap gap-1.5 items-center">
          <span className="text-[10px] font-black bg-blue-600 text-white px-3 py-1 rounded-full">
            {Math.round(
              totalConsumedKcal || parseInt(log?.calories?.toString() || "0"),
            )}{" "}
            ККАЛ СЪЕДЕНО
          </span>
          <span className="text-[10px] font-black bg-slate-800 text-white px-3 py-1 rounded-full flex items-center gap-1">
            <Target className="w-3 h-3 text-emerald-400" />
            ЦЕЛЬ: {Math.round(dynamicTargetCalories)} ККАЛ
          </span>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Блок показателей (Логи) */}
        {log && (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            <div className="bg-orange-50 p-3 rounded-2xl text-center">
              <Weight size={14} className="mx-auto mb-1 text-orange-500" />
              <p className="text-[10px] font-bold text-slate-400 uppercase">
                Вес
              </p>
              <p className="font-black text-slate-800">
                {renderValue(log.weight)} кг
              </p>
            </div>
            <div className="bg-blue-50 p-3 rounded-2xl text-center">
              <Footprints size={14} className="mx-auto mb-1 text-blue-500" />
              <p className="text-[10px] font-bold text-slate-400 uppercase">
                Шаги
              </p>
              <p className="font-black text-slate-800">
                {renderValue(log.steps?.toLocaleString())}
              </p>
            </div>
            <div className="bg-indigo-50 p-3 rounded-2xl text-center">
              <Moon size={14} className="mx-auto mb-1 text-indigo-500" />
              <p className="text-[10px] font-bold text-slate-400 uppercase">
                Сон
              </p>
              <p className="font-black text-slate-800">
                {renderValue(log.sleep_hours)}ч
              </p>
            </div>
            <div className="bg-cyan-50 p-3 rounded-2xl text-center">
              <Droplets size={14} className="mx-auto mb-1 text-cyan-500" />
              <p className="text-[10px] font-bold text-slate-400 uppercase">
                Вода
              </p>
              <p className="font-black text-slate-800">
                {log.water ? `${(log.water / 1000).toFixed(1)}л` : "--"}
              </p>
            </div>
            <div className="bg-green-50 p-3 rounded-2xl text-center">
              <Pizza size={14} className="mx-auto mb-1 text-green-500" />
              <p className="text-[10px] font-bold text-slate-400 uppercase">
                Еда лог
              </p>
              <p className="font-black text-slate-800">
                {renderValue(log.calories)}
              </p>
            </div>
          </div>
        )}

        {/* Статистика фактических макросов БЖУ */}
        {log && (
          <div className="flex gap-2">
            <MacroBox
              label="Белки"
              value={log.proteins}
              color="text-blue-500"
              bg="bg-blue-50/30"
            />
            <MacroBox
              label="Жиры"
              value={log.fats}
              color="text-orange-500"
              bg="bg-orange-50/30"
            />
            <MacroBox
              label="Угли"
              value={log.carbs}
              color="text-emerald-500"
              bg="bg-emerald-50/30"
            />
          </div>
        )}

        {/* 🟢 НОВЫЙ БЛОК: ДЕТАЛИЗАЦИЯ ВСЕХ АКТИВНОСТЕЙ ЗА ДЕНЬ */}
        <div className="space-y-3">
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest px-1">
            Выполненные активности
          </p>

          {log && log.activities && log.activities.length > 0 ? (
            <div className="space-y-2">
              <div className="grid gap-2">
                {log.activities.map((act: LoggedActivity) => {
                  const config = ACTIVITIES_MAP[act.activity_id];
                  return (
                    <div
                      key={act.id}
                      className="flex items-center justify-between p-3.5 bg-amber-50/40 border border-amber-100 rounded-2xl shadow-inner animate-in fade-in duration-150"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-100 text-amber-600 rounded-xl">
                          <Dumbbell className="w-4 h-4" />
                        </div>
                        <div className="text-left">
                          <p className="text-xs font-black text-slate-700">
                            {config ? config.name : "Тренировка"}
                          </p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                            Время выполнения:{" "}
                            <span className="text-slate-600">
                              {act.duration} мин
                            </span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 text-xs font-black text-amber-600 bg-white border border-amber-200 px-3 py-1.5 rounded-xl shadow-sm">
                        <Flame className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                        +{act.burned_calories} ккал
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Общая сумма сожженного за тренировки дня */}
              {totalBurnedCalories > 0 && (
                <div className="px-1 text-right">
                  <p className="text-[11px] font-black text-amber-600 uppercase tracking-tight italic">
                    🔥 Суммарный расход от спорта за день: +
                    {totalBurnedCalories} ккал
                  </p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic px-1">
              Активностей за этот день не зафиксировано
            </p>
          )}
        </div>

        {/* Блок приемов пищи */}
        <div className="space-y-3">
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest px-1">
            Приемы пищи
          </p>
          {meals.length > 0 ? (
            <div className="grid gap-3">
              {meals.map((meal) => (
                <MealCard key={meal.id} meal={meal} />
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic px-1">
              Нет записей о еде за этот день
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function MacroBox({
  label,
  value,
  color,
  bg,
}: {
  label: string;
  value?: number;
  color: string;
  bg: string;
}) {
  return (
    <div
      className={`flex-1 ${bg} px-4 py-2 rounded-2xl border border-slate-100/50`}
    >
      <p
        className={`text-[8px] font-black uppercase tracking-widest ${color} mb-0.5`}
      >
        {label}
      </p>
      <p className="text-sm font-black text-slate-700">
        {value ? `${Math.round(value)}г` : "--"}
      </p>
    </div>
  );
}
