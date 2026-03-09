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
  onDelete: (id: string) => Promise<void>;
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
      className={`bg-white border transition-all duration-200 rounded-2xl overflow-hidden ${
        isExpanded
          ? "ring-2 ring-blue-500 border-transparent shadow-lg"
          : "border-gray-100 shadow-sm hover:border-blue-200"
      }`}
    >
      {/* Шапка карточки */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-5 cursor-pointer select-none"
      >
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
            <Calendar size={12} />
            {formatMealTime(meal.created_at)}
          </div>

          <div className="relative" onClick={(e) => e.stopPropagation()}>
            {isConfirming ? (
              <div className="flex items-center gap-1 bg-red-50 p-1 rounded-lg border border-red-100 animate-in fade-in zoom-in duration-200">
                <button
                  onClick={handleDelete}
                  className="p-1 text-red-600 hover:bg-red-100 rounded"
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
                  className="p-1 text-gray-400 hover:bg-gray-100 rounded"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsConfirming(true)}
                className="text-gray-300 hover:text-red-500 transition-colors p-1"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        </div>

        <div className="flex justify-between items-end">
          <h3 className="font-bold text-lg text-gray-800">
            {getMealType(meal.created_at)}
          </h3>
          <div className="text-right leading-none">
            <span className="text-2xl font-black text-gray-900">
              {Math.round(meal.total_kcal)}
            </span>
            <span className="text-[10px] text-gray-400 ml-1 uppercase font-black">
              ккал
            </span>
          </div>
        </div>

        <div className="flex gap-4 mt-3">
          <span className="text-xs font-bold text-orange-500">
            Б: {meal.total_p.toFixed(1)}г
          </span>
          <span className="text-xs font-bold text-yellow-600">
            Ж: {meal.total_f.toFixed(1)}г
          </span>
          <span className="text-xs font-bold text-green-600">
            У: {meal.total_c.toFixed(1)}г
          </span>
          <div className="ml-auto text-blue-500">
            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>
        </div>
      </div>

      {/* Выпадающий список продуктов */}
      {isExpanded && (
        <div className="px-5 pb-5 bg-blue-50/30 border-t border-blue-50 animate-in slide-in-from-top-2 duration-300">
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest py-3">
            Состав:
          </p>
          <div className="space-y-2">
            {meal.items.map((item, idx) => (
              <div
                key={idx}
                className="flex justify-between items-center text-sm bg-white p-3 rounded-xl border border-blue-100/50 shadow-sm"
              >
                <span className="font-medium text-gray-700">{item.name}</span>
                <div className="flex items-center gap-3">
                  <span className="flex items-center text-gray-400 text-xs gap-1">
                    <Scale size={12} /> {item.weight}г
                  </span>
                  <span className="font-bold text-gray-900 w-12 text-right">
                    {Math.round((item.kcal / 100) * item.weight)}{" "}
                    <span className="text-[9px] text-gray-400">кк</span>
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
