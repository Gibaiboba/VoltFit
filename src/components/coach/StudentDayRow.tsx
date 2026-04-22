"use client";
import { MealCard } from "@/components/history/meal-card";
import { SavedMeal } from "@/types/food";
import { DailyLog } from "@/types/shared";
import { Footprints, Moon, Weight, Pizza, Droplets } from "lucide-react";

interface StudentDayRowProps {
  date: string;
  log?: DailyLog;
  meals: SavedMeal[];
}

export function StudentDayRow({ date, log, meals }: StudentDayRowProps) {
  const displayDate = new Date(date).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    weekday: "short",
  });

  const totalKcal = meals.reduce((sum, m) => sum + m.total_kcal, 0);

  const renderValue = (value: number | string | undefined | null) => {
    return value ? value : "--";
  };

  return (
    <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden mb-6">
      {/* Шапка дня */}
      <div className="bg-slate-50/50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
        <h3 className="font-black text-slate-800 text-sm uppercase tracking-wider">
          {displayDate}
        </h3>
        {totalKcal > 0 && (
          <span className="text-[10px] font-black bg-blue-600 text-white px-3 py-1 rounded-full">
            {Math.round(totalKcal)} ККАЛ ЕДА
          </span>
        )}
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
                {renderValue(log.weight)}
              </p>
            </div>
            <div className="bg-blue-50 p-3 rounded-2xl text-center">
              <Footprints size={14} className="mx-auto mb-1 text-blue-500" />
              <p className="text-[10px] font-bold text-slate-400 uppercase">
                Шаги
              </p>
              <p className="font-black text-slate-800">
                {renderValue(log.steps)}
              </p>
            </div>
            <div className="bg-indigo-50 p-3 rounded-2xl text-center">
              <Moon size={14} className="mx-auto mb-1 text-indigo-500" />
              <p className="text-[10px] font-bold text-slate-400 uppercase">
                Сон
              </p>
              <p className="font-black text-slate-800">
                {renderValue(log.sleep_hours)}
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
                Отчет
              </p>
              <p className="font-black text-slate-800">
                {renderValue(log.calories)}
              </p>
            </div>
          </div>
        )}

        {/* 2. НОВЫЙ БЛОК: СТАТИСТИКА БЖУ */}
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

        {/* Блок приемов пищи */}
        <div className="space-y-3">
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest px-1">
            Приемы пищи
          </p>
          {meals.length > 0 ? (
            <div className="grid gap-3">
              {meals.map((meal) => (
                <MealCard key={meal.id} meal={meal} onDelete={async () => {}} />
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

// 3. Вспомогательный компонент для БЖУ (добавь в конец файла)
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
