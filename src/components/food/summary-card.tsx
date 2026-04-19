import { Tag, Save, Loader2 } from "lucide-react";
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
      {/* 1. ПОЛЕ НАЗВАНИЯ: Вынесено сюда, так как оно нужно только перед сохранением */}
      <div className="relative group">
        <Tag
          className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors"
          size={18}
        />
        <input
          type="text"
          placeholder="Название (Обед, Смузи и т.д.)"
          value={mealName}
          onChange={(e) => setMealName(e.target.value)}
          className="w-full pl-12 pr-6 py-5 bg-slate-50 border border-slate-100 rounded-[28px] focus:bg-white focus:ring-4 focus:ring-blue-50 focus:border-blue-200 outline-none transition-all font-bold text-slate-700"
        />
      </div>

      {/* 2. ИТОГОВЫЙ БАННЕР: Главный визуальный акцент */}
      <div className="bg-slate-900 rounded-[35px] p-8 text-white shadow-2xl relative overflow-hidden text-left">
        <div className="relative z-10">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400">
            Общая ценность
          </span>
          <div className="text-6xl font-black italic mt-1">
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
              <p className="text-xl font-black text-indigo-400">
                {totals.c.toFixed(1)}г
              </p>
            </div>
          </div>
        </div>
        {/* Декоративное свечение */}
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      {/* 3. КНОПКА СОХРАНЕНИЯ */}
      <button
        onClick={onSave}
        disabled={isPending || !mealName.trim()} // Не даем сохранить без названия
        className="w-full py-6 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-[30px] shadow-xl shadow-blue-100 transition-all active:scale-[0.98] disabled:bg-slate-100 disabled:text-slate-400 flex items-center justify-center gap-3 uppercase text-xs tracking-[0.2em]"
      >
        {isPending ? (
          <Loader2 className="animate-spin" size={20} />
        ) : (
          <Save size={20} />
        )}
        {isPending ? "Сохранение..." : "Добавить в историю"}
      </button>
    </div>
  );
}
