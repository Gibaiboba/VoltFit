"use client";

import { Coffee, Sun, Moon, Sparkles, Dumbbell } from "lucide-react";

interface QuickMenuProps {
  onAddMeal: (slot: "breakfast" | "lunch" | "dinner" | "snack") => void;
  onAddActivity: () => void;
  onFastWaterAdd: () => void;
  isWaterDisabled: boolean;
  isPending: boolean;
}

export function QuickMenu({
  onAddMeal,
  onAddActivity,
  onFastWaterAdd,
  isWaterDisabled,
  isPending,
}: QuickMenuProps) {
  return (
    <div className="w-full max-w-xs mx-auto mb-4 bg-white/90 backdrop-blur-2xl border border-white p-4 rounded-3xl shadow-xl space-y-3 animate-in slide-in-from-bottom-5">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
        Быстрое добавление тренера
      </p>

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => onAddMeal("breakfast")}
          className="flex items-center gap-2 p-3 bg-amber-50/60 hover:bg-amber-50 border border-amber-100 rounded-xl transition-all group w-full text-left cursor-pointer"
        >
          <Coffee className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-bold text-slate-700">Завтрак</span>
        </button>
        <button
          type="button"
          onClick={() => onAddMeal("lunch")}
          className="flex items-center gap-2 p-3 bg-orange-50/60 hover:bg-orange-50 border border-orange-100 rounded-xl transition-all group w-full text-left cursor-pointer"
        >
          <Sun className="w-4 h-4 text-orange-500 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-bold text-slate-700">Обед</span>
        </button>
        <button
          type="button"
          onClick={() => onAddMeal("dinner")}
          className="flex items-center gap-2 p-3 bg-blue-50/60 hover:bg-blue-50 border border-blue-100 rounded-xl transition-all group w-full text-left cursor-pointer"
        >
          <Moon className="w-4 h-4 text-blue-500 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-bold text-slate-700">Ужин</span>
        </button>
        <button
          type="button"
          onClick={() => onAddMeal("snack")}
          className="flex items-center gap-2 p-3 bg-purple-50/60 hover:bg-purple-50 border border-purple-100 rounded-xl transition-all group w-full text-left cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-purple-500 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-bold text-slate-700">Перекус</span>
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={onAddActivity}
          className="flex items-center justify-center gap-2 p-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-sm transition-all group cursor-pointer"
        >
          <Dumbbell className="w-4 h-4 text-emerald-100 group-hover:rotate-12 transition-transform" />
          <span className="text-xs font-black uppercase tracking-wider">
            Тренировка
          </span>
        </button>

        <button
          type="button"
          disabled={isWaterDisabled || isPending}
          onClick={onFastWaterAdd}
          className="flex items-center justify-center gap-2 p-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl shadow-sm transition-all group cursor-pointer disabled:opacity-60"
        >
          <span className="text-sm group-hover:scale-110 transition-transform">
            🥛
          </span>
          <span className="text-xs font-black uppercase tracking-wider">
            Вода +250
          </span>
        </button>
      </div>
    </div>
  );
}
