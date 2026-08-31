import { Flame, Activity } from "lucide-react";

interface MetricsDisplayProps {
  calories: number;
  macros: { protein: number; fat: number; carbs: number };
  bmi: string | null;
}

export function MetricsDisplay({ calories, macros, bmi }: MetricsDisplayProps) {
  return (
    <div className="space-y-4">
      {calories > 0 && (
        <div className="bg-slate-900 text-white p-5 rounded-2xl border-2 border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2 text-blue-400">
              <Flame size={16} />
              <span className="text-[10px] font-black uppercase tracking-wider">
                Новая норма дня
              </span>
            </div>
            <span className="text-xl font-black italic text-blue-400">
              {calories} ккал
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="bg-slate-800/50 p-2 rounded-xl">
              <p className="text-[9px] text-slate-400 font-bold uppercase mb-0.5">
                Белки
              </p>
              <p className="font-black text-orange-400">{macros.protein}г</p>
            </div>
            <div className="bg-slate-800/50 p-2 rounded-xl">
              <p className="text-[9px] text-slate-400 font-bold uppercase mb-0.5">
                Жиры
              </p>
              <p className="font-black text-rose-400">{macros.fat}г</p>
            </div>
            <div className="bg-slate-800/50 p-2 rounded-xl">
              <p className="text-[9px] text-slate-400 font-bold uppercase mb-0.5">
                Углеводы
              </p>
              <p className="font-black text-indigo-400">{macros.carbs}г</p>
            </div>
          </div>
        </div>
      )}

      {bmi && (
        <div className="bg-blue-50 p-4 rounded-xl flex items-center justify-between border-2 border-blue-200">
          <div className="flex items-center gap-3 text-blue-900">
            <Activity size={18} className="text-blue-600" />
            <span className="text-xs font-black uppercase tracking-tight italic">
              Индекс массы тела:
            </span>
          </div>
          <span className="text-xl font-black text-blue-700 italic">{bmi}</span>
        </div>
      )}
    </div>
  );
}
