"use client";

import { useMemo } from "react";
import { MealCard } from "@/components/history/meal-card";
import { useDayRowCalculations } from "@/hooks/coach/use-day-row-calculations";
import { DayActivitiesList } from "./DayActivitiesList";
import { MacroBox } from "./MacroBox";
import { Footprints, Moon, Weight, Droplets } from "lucide-react";
import { StudentDayRowProps } from "@/types/coach";
import { MEAL_SLOTS } from "@/constants/mealTypes";

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

  const { totalConsumedKcal, totalBurnedCalories, dynamicTargetCalories } =
    useDayRowCalculations({
      log,
      meals,
      baseCalories,
      studentWeight,
      studentGender,
    });

  // Сортируем приемы пищи на основе порядка из MEAL_SLOTS
  const sortedMeals = useMemo(() => {
    if (!meals || meals.length === 0) return [];

    // Создаем карту индексов для быстрого поиска
    const orderMap = Object.fromEntries(
      MEAL_SLOTS.map((slot, index) => [slot.id, index]),
    );

    return [...meals].sort((a, b) => {
      const indexA = orderMap[a.meal_type as string] ?? 999;
      const indexB = orderMap[b.meal_type as string] ?? 999;

      return indexA - indexB;
    });
  }, [meals]);

  const renderValue = (value: number | string | undefined | null) => {
    return value ? value : "--";
  };

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6 animate-in fade-in duration-200">
      {/* Шапка дня с балансом калорий */}
      <div className="bg-slate-50/40 px-8 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center justify-center sm:justify-start w-full sm:w-auto">
          <h3 className="font-black text-slate-800 text-xl sm:text-2xl text-center sm:text-left tracking-tight">
            {displayDate}
          </h3>
        </div>

        <div className="flex items-center justify-center sm:justify-end gap-2 text-sm sm:text-base text-slate-400 font-bold">
          <span className="text-slate-800 font-black text-lg sm:text-xl">
            {Math.round(
              totalConsumedKcal || parseInt(log?.calories?.toString() || "0"),
            ).toLocaleString()}
          </span>
          <span className="font-medium text-slate-300 text-lg">/</span>
          <span className="flex items-center gap-1.5 font-medium text-slate-500">
            {Math.round(dynamicTargetCalories).toLocaleString()} ккал
            <span className="text-xs text-slate-400 font-normal bg-slate-100 px-2 py-0.5 rounded-md ml-1">
              цель
            </span>
          </span>
        </div>
      </div>

      <div className="p-3 space-y-2">
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
              label="Углев"
              value={log.carbs}
              color="text-emerald-500"
              bg="bg-emerald-50/30"
            />
          </div>
        )}

        {/* Блок показателей (Логи) - Порядок: Шаги, Вода, Вес, Сон */}
        {log && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* 1. ШАГИ */}
            <div className="bg-slate-50/60 p-3 rounded-[20px] flex items-center gap-3 text-left transition-all hover:bg-slate-50">
              <div className="w-8 h-8 rounded-xl bg-blue-100/70 text-blue-600 flex items-center justify-center shrink-0">
                <Footprints size={15} className="stroke-[2.5]" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Шаги
                </p>
                <p className="text-sm font-black text-slate-800 mt-0.5">
                  {renderValue(log.steps?.toLocaleString())}
                </p>
              </div>
            </div>

            {/* 2. ВОДА */}
            <div className="bg-slate-50/60 p-3 rounded-[20px] flex items-center gap-3 text-left transition-all hover:bg-slate-50">
              <div className="w-8 h-8 rounded-xl bg-cyan-100/70 text-cyan-600 flex items-center justify-center shrink-0">
                <Droplets size={15} className="stroke-[2.5]" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Вода
                </p>
                <p className="text-sm font-black text-slate-800 mt-0.5">
                  {log.water ? `${(log.water / 1000).toFixed(1)}л` : "--"}
                </p>
              </div>
            </div>

            {/* 3. ВЕС */}
            <div className="bg-slate-50/60 p-3 rounded-[20px] flex items-center gap-3 text-left transition-all hover:bg-slate-50">
              <div className="w-8 h-8 rounded-xl bg-orange-100/70 text-orange-600 flex items-center justify-center shrink-0">
                <Weight size={15} className="stroke-[2.5]" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Вес
                </p>
                <p className="text-sm font-black text-slate-800 mt-0.5">
                  {renderValue(log.weight)} кг
                </p>
              </div>
            </div>

            {/* 4. СОН */}
            <div className="bg-slate-50/60 p-3 rounded-[20px] flex items-center gap-3 text-left transition-all hover:bg-slate-50">
              <div className="w-8 h-8 rounded-xl bg-indigo-100/70 text-indigo-600 flex items-center justify-center shrink-0">
                <Moon size={15} className="stroke-[2.5]" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Сон
                </p>
                <p className="text-sm font-black text-slate-800 mt-0.5">
                  {renderValue(log.sleep_hours)}ч
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Детализация активностей */}
        <DayActivitiesList
          log={log}
          totalBurnedCalories={totalBurnedCalories}
        />

        {/* Блок приемов пищи с сортировкой */}
        <div className="space-y-3">
          {sortedMeals.length > 0 ? (
            <div className="grid gap-3">
              {sortedMeals.map((meal) => (
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
