"use client";
import { MealCard } from "@/components/history/meal-card";
import { SavedMeal } from "@/types/food";
import { DailyLog } from "@/types/shared";
import { useDayRowCalculations } from "@/hooks/coach/use-day-row-calculations";
import { DayActivitiesList } from "./DayActivitiesList";
import { MacroBox } from "./MacroBox";
import { Footprints, Moon, Weight, Pizza, Droplets } from "lucide-react";

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

  const { totalConsumedKcal, totalBurnedCalories, dynamicTargetCalories } =
    useDayRowCalculations({
      log,
      meals,
      baseCalories,
      studentWeight,
      studentGender,
    });

  const renderValue = (value: number | string | undefined | null) => {
    return value ? value : "--";
  };

  return (
    <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden mb-6 animate-in fade-in duration-200">
      {/* Шапка дня с балансом калорий */}
      <div className="bg-slate-50/40 px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-1.5 h-4 bg-blue-600 rounded-full shrink-0" />{" "}
          {/* Стильный вертикальный акцент */}
          <h3 className="font-black text-slate-800 text-sm tracking-tight">
            {displayDate}
          </h3>
        </div>

        {/* Аккуратный текстовый баланс калорий в стиле фитнес-трекеров */}
        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold">
          <span className="text-slate-800 font-black">
            {Math.round(
              totalConsumedKcal || parseInt(log?.calories?.toString() || "0"),
            ).toLocaleString()}
          </span>
          <span className="font-medium text-slate-300">/</span>
          <span className="flex items-center gap-1 font-medium text-slate-500">
            {Math.round(dynamicTargetCalories).toLocaleString()} ккал
            <span className="text-[10px] text-slate-400 font-normal bg-slate-100 px-1.5 py-0.5 rounded-md border border-slate-200/60">
              цель
            </span>
          </span>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Блок показателей (Логи) */}
        {log && (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {/* Вес */}
            <div className="bg-slate-50/60 border border-slate-100/80 p-3 rounded-[20px] flex items-center gap-3 text-left transition-all hover:bg-slate-50">
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

            {/* Шаги */}
            <div className="bg-slate-50/60 border border-slate-100/80 p-3 rounded-[20px] flex items-center gap-3 text-left transition-all hover:bg-slate-50">
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

            {/* Сон */}
            <div className="bg-slate-50/60 border border-slate-100/80 p-3 rounded-[20px] flex items-center gap-3 text-left transition-all hover:bg-slate-50">
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

            {/* Вода */}
            <div className="bg-slate-50/60 border border-slate-100/80 p-3 rounded-[20px] flex items-center gap-3 text-left transition-all hover:bg-slate-50">
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

            {/* Еда лог */}
            <div className="bg-slate-50/60 border border-slate-100/80 p-3 rounded-[20px] flex items-center gap-3 text-left transition-all hover:bg-slate-50 col-span-2 sm:col-span-1">
              <div className="w-8 h-8 rounded-xl bg-green-100/70 text-green-600 flex items-center justify-center shrink-0">
                <Pizza size={15} className="stroke-[2.5]" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Еда лог
                </p>
                <p className="text-sm font-black text-slate-800 mt-0.5">
                  {renderValue(log.calories)} ккал
                </p>
              </div>
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

        {/* Вынесенный блок детализации активностей */}
        <DayActivitiesList
          log={log}
          totalBurnedCalories={totalBurnedCalories}
        />

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
