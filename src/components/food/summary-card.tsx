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
    <div className="space-y-6">
      {/* 1. ПОЛЕ ЗАМЕТКИ: Теперь это комментарий для тренера */}
      <div className="relative group">
        <MessageSquare
          className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-slate-900 transition-colors"
          size={18}
        />
        <input
          type="text"
          placeholder="Заметка тренеру (необязательно)"
          value={mealName}
          onChange={(e) => setMealName(e.target.value)}
          className="w-full pl-12 pr-6 py-5 bg-slate-50 border border-slate-100 rounded-[28px] focus:bg-white focus:ring-4 focus:ring-slate-100 focus:border-slate-200 outline-none transition-all font-bold text-slate-700 placeholder:text-slate-300"
        />
      </div>

      {/* 2. ИТОГОВЫЙ БАННЕР: КБЖУ */}
      <div className="bg-slate-900 rounded-[35px] p-8 text-white shadow-2xl relative overflow-hidden text-left">
        <div className="relative z-10">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
            Общая ценность
          </span>
          <div className="text-6xl font-black italic mt-1 tracking-tighter">
            {Math.round(totals.kcal)}
            <span className="text-xl opacity-30 ml-2 not-italic font-bold">
              ккал
            </span>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-8 mt-8 border-t border-white/10">
            <div className="text-center">
              <p className="text-[9px] font-black opacity-40 uppercase mb-2">
                Белки
              </p>
              <p className="text-xl font-black text-orange-400">
                {totals.p.toFixed(1)}г
              </p>
            </div>
            <div className="text-center border-x border-white/5">
              <p className="text-[9px] font-black opacity-40 uppercase mb-2">
                Жиры
              </p>
              <p className="text-xl font-black text-rose-400">
                {totals.f.toFixed(1)}г
              </p>
            </div>
            <div className="text-center">
              <p className="text-[9px] font-black opacity-40 uppercase mb-2">
                Углеводы
              </p>
              <p className="text-xl font-black text-blue-400">
                {totals.c.toFixed(1)}г
              </p>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={onSave}
        disabled={isPending}
        className="w-full py-6 bg-slate-900 hover:bg-black text-white font-black rounded-[30px] shadow-xl shadow-slate-200 transition-all active:scale-[0.98] disabled:bg-slate-100 disabled:text-slate-400 flex items-center justify-center gap-3 uppercase text-xs tracking-[0.2em]"
      >
        {isPending ? (
          <Loader2 className="animate-spin" size={20} />
        ) : (
          <Save size={20} />
        )}
        {isPending ? "Сохранение..." : "Добавить в дневник"}
      </button>
    </div>
  );
}
