"use client";
import { WeeklyAverages } from "@/hooks/coach/use-student-timeline";

interface AveragesTabProps {
  averages: WeeklyAverages | null;
}

export function AveragesTab({ averages }: AveragesTabProps) {
  if (!averages) {
    return (
      <div className="text-center py-12 text-slate-400 font-medium">
        Недостаточно данных для расчета средних значений
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto mb-24 bg-white p-3 rounded-xl border border-slate-100 shadow-sm space-y-6 animate-fade-in">
      <div>
        <p className="text-xs text-center text-slate-400 mt-1">
          Среднее за 7 отчетов
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm font-bold text-slate-700">
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <span className="text-xs text-slate-400 block mb-1">Вес</span>
          <span className="text-lg font-black text-slate-800">
            {averages.weight ? `${averages.weight} кг` : "—"}
          </span>
        </div>

        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <span className="text-xs text-slate-400 block mb-1">Калории</span>
          <span className="text-lg font-black text-slate-800">
            {averages.calories} ккал
          </span>
        </div>

        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 col-span-2">
          <div className="flex gap-4 items-center mt-1">
            <div>
              <span className="text-[10px] uppercase text-blue-500 block">
                Белки
              </span>
              <span className="text-base font-black text-blue-600">
                {averages.proteins}г
              </span>
            </div>
            <div className="text-slate-200 text-xl font-light">|</div>
            <div>
              <span className="text-[10px] uppercase text-orange-400 block">
                Жиры
              </span>
              <span className="text-base font-black text-orange-500">
                {averages.fats}г
              </span>
            </div>
            <div className="text-slate-200 text-xl font-light">|</div>
            <div>
              <span className="text-[10px] uppercase text-emerald-400 block">
                Углеводы
              </span>
              <span className="text-base font-black text-emerald-500">
                {averages.carbs}г
              </span>
            </div>
          </div>
        </div>

        <div className="bg-blue-50/60 p-4 rounded-2xl border border-blue-100/50 col-span-2">
          <span className="text-xs text-blue-400 block mb-1">Шаги в день</span>
          <span className="text-xl font-black text-blue-700">
            {averages.steps.toLocaleString()}
          </span>
        </div>

        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <span className="text-xs text-slate-400 block mb-1">Сон</span>
          <span className="text-lg font-black text-slate-800">
            {averages.sleep} ч
          </span>
        </div>

        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <span className="text-xs text-slate-400 block mb-1">Вода</span>
          <span className="text-lg font-black text-slate-800">
            {averages.water.toFixed(1)} л
          </span>
        </div>
      </div>
    </div>
  );
}
