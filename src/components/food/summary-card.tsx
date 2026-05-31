import { MessageSquare, Save, Loader2 } from "lucide-react";
import { Totals } from "@/types/food";

interface SummaryCardProps {
  totals: Totals;
  mealName: string;
  setMealName: (val: string) => void;
  onSave: () => void;
  isPending: boolean;
}

export function SummaryCard({
  totals,
  mealName,
  setMealName,
  onSave,
  isPending,
}: SummaryCardProps) {
  return (
    // md:flex-row выстраивает элементы горизонтально на больших экранах
    <div className="flex flex-col md:flex-row items-stretch md:items-center gap-6 w-full">
      {/* 1. ПОЛЕ ЗАМЕТКИ */}
      <div className="relative group flex-1">
        <MessageSquare
          className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-slate-900 transition-colors"
          size={18}
        />
        <input
          type="text"
          placeholder="Заметка тренеру (необязательно)"
          value={mealName}
          onChange={(e) => setMealName(e.target.value)}
          className="w-full pl-12 pr-6 py-5 bg-slate-50 border border-slate-100 rounded-[24px] focus:bg-white focus:ring-4 focus:ring-slate-100 focus:border-slate-200 outline-none transition-all font-bold text-slate-700 placeholder:text-slate-300"
        />
      </div>

      {/* 2. ИТОГОВЫЙ БАННЕР (ГОРИЗОНТАЛЬНЫЙ КБЖУ) */}
      <div className="bg-slate-900 rounded-[28px] p-6 text-white shadow-2xl relative overflow-hidden flex-2 flex flex-col sm:flex-row items-center gap-6 min-w-max">
        <div className="text-left sm:pr-6 sm:border-r sm:border-white/10">
          <div className="text-4xl font-black italic mt-1 tracking-tighter whitespace-nowrap">
            {Math.round(totals.kcal)}
            <span className="text-sm opacity-30 ml-1 not-italic font-bold">
              ккал
            </span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-center">
            <p className="text-[9px] font-black opacity-40 uppercase mb-1">
              Белки
            </p>
            <p className="text-lg font-black text-orange-400 whitespace-nowrap">
              {totals.p.toFixed(1)}г
            </p>
          </div>
          <div className="text-center">
            <p className="text-[9px] font-black opacity-40 uppercase mb-1">
              Жиры
            </p>
            <p className="text-lg font-black text-rose-400 whitespace-nowrap">
              {totals.f.toFixed(1)}г
            </p>
          </div>
          <div className="text-center">
            <p className="text-[9px] font-black opacity-40 uppercase mb-1">
              Углеводы
            </p>
            <p className="text-lg font-black text-blue-400 whitespace-nowrap">
              {totals.c.toFixed(1)}г
            </p>
          </div>
        </div>
      </div>

      {/* 3. КНОПКА СОХРАНЕНИЯ */}
      <button
        onClick={onSave}
        disabled={isPending}
        className="md:w-auto px-8 py-5 bg-slate-900 hover:bg-black text-white font-black rounded-[24px] shadow-xl shadow-slate-200 transition-all active:scale-[0.98] disabled:bg-slate-100 disabled:text-slate-400 flex items-center justify-center gap-3 uppercase text-xs tracking-[0.2em] whitespace-nowrap"
      >
        {isPending ? (
          <Loader2 className="animate-spin" size={20} />
        ) : (
          <Save size={20} />
        )}
        {isPending ? "Сохранение..." : "Добавить"}
      </button>
    </div>
  );
}
