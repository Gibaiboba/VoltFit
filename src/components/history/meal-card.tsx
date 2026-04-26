"use client";

import { useState } from "react";
import { SavedMeal } from "@/types/food";
import { getMealType, formatMealTime } from "@/lib/utils/date-utils";
import {
  Calendar,
  Trash2,
  Check,
  X,
  Loader2,
  Scale,
  ChevronUp,
  ChevronDown,
} from "lucide-react";

interface MealCardProps {
  meal: SavedMeal;
  onDelete: (id: string) => void;
}

export function MealCard({ meal, onDelete }: MealCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(meal.id);
    } finally {
      setIsDeleting(false);
      setIsConfirming(false);
    }
  };

  return (
    <div
      className={`bg-white border transition-all duration-300 rounded-[32px] overflow-hidden ${
        isExpanded
          ? "ring-2 ring-blue-500 border-transparent shadow-xl translate-y-[-2px]"
          : "border-gray-100 shadow-sm hover:border-blue-200"
      }`}
    >
      {/* Шапка карточки */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-6 cursor-pointer select-none"
      >
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2 text-[10px] text-gray-400 font-black uppercase tracking-widest">
            <Calendar size={12} className="text-blue-400" />
            {formatMealTime(meal.created_at)}
          </div>

          <div className="relative" onClick={(e) => e.stopPropagation()}>
            {isConfirming ? (
              <div className="flex items-center gap-1 bg-red-50 p-1 rounded-xl border border-red-100 animate-in fade-in zoom-in duration-200">
                <button
                  onClick={handleDelete}
                  className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Check size={16} />
                  )}
                </button>
                <button
                  onClick={() => setIsConfirming(false)}
                  className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsConfirming(true)}
                className="text-gray-200 hover:text-red-500 transition-colors p-2"
              >
                <Trash2 size={18} />
              </button>
            )}
          </div>
        </div>

        <div className="flex justify-between items-end">
          <div className="text-left">
            {/* ИЗМЕНЕНИЕ: Используем meal_name или фоллбек на тип приема пищи */}
            <h3 className="font-black text-xl text-gray-800 leading-tight">
              {meal.meal_name || getMealType(meal.created_at)}
            </h3>
            <p className="text-[10px] font-bold text-gray-400 uppercase mt-1">
              {meal.items.length} ингредиентов
            </p>
          </div>
          <div className="text-right leading-none">
            <span className="text-3xl font-black text-gray-900 italic">
              {Math.round(meal.total_kcal)}
            </span>
            <span className="text-[10px] text-gray-400 ml-1 uppercase font-black">
              ккал
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 mt-5 pt-5 border-t border-gray-50">
          <div className="flex gap-3">
            <span className="text-[10px] font-black text-orange-500 bg-orange-50 px-2 py-0.5 rounded-md uppercase">
              Б: {meal.total_p.toFixed(0)}
            </span>
            <span className="text-[10px] font-black text-rose-500 bg-rose-50 px-2 py-0.5 rounded-md uppercase">
              Ж: {meal.total_f.toFixed(0)}
            </span>
            <span className="text-[10px] font-black text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-md uppercase">
              У: {meal.total_c.toFixed(0)}
            </span>
          </div>
          <div className="ml-auto text-blue-400 bg-blue-50 w-8 h-8 rounded-full flex items-center justify-center">
            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>
        </div>
      </div>

      {/* Выпадающий список продуктов */}
      {isExpanded && (
        <div className="px-6 pb-6 bg-slate-50/50 border-t border-gray-50 animate-in slide-in-from-top-2 duration-300">
          <p className="text-[9px] text-gray-400 font-black uppercase tracking-[0.2em] py-4 text-left">
            Детальный состав:
          </p>
          <div className="space-y-2">
            {meal.items.map((item, idx) => (
              <div
                key={idx}
                className="flex justify-between items-center text-sm bg-white p-4 rounded-[20px] border border-gray-100 shadow-sm"
              >
                <div className="text-left">
                  <p className="font-bold text-gray-700">{item.name}</p>
                  <p className="text-[10px] text-gray-400 font-medium flex items-center gap-1">
                    <Scale size={10} /> {item.weight}г
                  </p>
                </div>
                <div className="font-black text-gray-900 text-right">
                  {Math.round((item.kcal / 100) * item.weight)}{" "}
                  <span className="text-[9px] text-gray-400 uppercase">
                    ккал
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
