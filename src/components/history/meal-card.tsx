"use client";

import { useState } from "react";
import { SavedMeal, SelectedProduct } from "@/types/food";
import { formatMealTime } from "@/lib/utils/date-utils";
import {
  Calendar,
  Trash2,
  Check,
  X,
  Loader2,
  Scale,
  ChevronUp,
  ChevronDown,
  Utensils,
  HelpCircle,
} from "lucide-react";

interface MealCardProps {
  meal: SavedMeal;
  onDelete?: (id: string) => void;
  onRemoveItem?: (data: { mealId: string; productId: string }) => void;
}

const MEAL_LABELS: Record<string, string> = {
  breakfast: "Завтрак",
  lunch: "Обед",
  dinner: "Ужин",
  snack: "Перекус",
};

export function MealCard({ meal, onDelete, onRemoveItem }: MealCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showFullComment, setShowFullComment] = useState(false);

  const typeLabel = MEAL_LABELS[meal.meal_type as string] || "Прием пищи";
  const hasComment = meal.meal_name && meal.meal_name.trim().length > 0;

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onDelete) return;
    setIsDeleting(true);
    try {
      onDelete(meal.id);
    } finally {
      setIsDeleting(false);
      setIsConfirming(false);
    }
  };

  return (
    <div
      className={`w-full bg-white border transition-all duration-200 rounded-2xl overflow-hidden ${
        isExpanded
          ? "ring-1 ring-blue-500 border-transparent shadow-md"
          : "border-gray-100 shadow-sm hover:border-gray-200"
      }`}
    >
      {/* Шапка карточки */}
      <div
        onClick={() => {
          setIsExpanded(!isExpanded);
          setShowFullComment(false);
        }}
        className="p-4 cursor-pointer select-none flex flex-col gap-2"
      >
        <div className="flex justify-between items-center gap-2">
          <div className="text-left min-w-0">
            <h3 className="font-extrabold text-base text-gray-900 leading-tight uppercase tracking-tight truncate">
              {typeLabel}
            </h3>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="text-right leading-none">
              <span className="text-xl font-black text-gray-900 italic">
                {Math.round(meal.total_kcal)}
              </span>
              <span className="text-[9px] text-gray-400 ml-0.5 uppercase font-black">
                ккал
              </span>
            </div>

            {onDelete && (
              <div
                className="relative z-10"
                onClick={(e) => e.stopPropagation()}
              >
                {isConfirming ? (
                  <div className="flex items-center gap-0.5 bg-red-50 p-0.5 rounded-lg border border-red-100 animate-in fade-in zoom-in-95 duration-150">
                    <button
                      onClick={handleDelete}
                      className="p-1 text-red-600 hover:bg-red-100 rounded-md transition-colors"
                      disabled={isDeleting}
                    >
                      {isDeleting ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Check size={14} />
                      )}
                    </button>
                    <button
                      onClick={() => setIsConfirming(false)}
                      className="p-1 text-gray-400 hover:bg-gray-100 rounded-md transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsConfirming(true)}
                    className="text-gray-300 hover:text-red-500 transition-colors p-1.5 rounded-lg hover:bg-gray-50"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* БЖУ и стрелка */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex gap-1.5">
            <span className="text-[9px] font-black text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded uppercase">
              Б: {meal.total_p.toFixed(0)}
            </span>
            <span className="text-[9px] font-black text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded uppercase">
              Ж: {meal.total_f.toFixed(0)}
            </span>
            <span className="text-[9px] font-black text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded uppercase">
              У: {meal.total_c.toFixed(0)}
            </span>
          </div>
          <div className="text-gray-400 bg-gray-50 w-6 h-6 rounded-full flex items-center justify-center shrink-0">
            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </div>
        </div>
      </div>

      {/* Контент аккордеона */}
      {isExpanded && (
        <div className="px-4 pb-4 pt-3 bg-slate-50/40 border-t border-gray-50/50 animate-in slide-in-from-top-1 duration-200">
          {/* Блок мета-информации */}
          <div className="flex flex-col gap-2 mb-3">
            <div className="flex justify-between items-center gap-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider px-0.5">
              {/* Слева: Кнопка-комментарий */}
              {hasComment ? (
                <button
                  onClick={() => setShowFullComment(!showFullComment)}
                  className="flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-blue-600 normal-case tracking-normal min-w-0 transition-colors select-none text-left"
                >
                  <Utensils size={11} className="text-gray-400 shrink-0" />
                  <span className="truncate max-w-[140px] sm:max-w-[200px]">
                    {meal.meal_name}
                  </span>
                  <HelpCircle size={10} className="text-gray-300 shrink-0" />
                </button>
              ) : (
                <div />
              )}

              {/* Справа: Время создания */}
              <div className="flex items-center gap-1 shrink-0 ml-auto">
                <Calendar size={10} className="text-blue-400" />
                <span>{formatMealTime(meal.created_at)}</span>
              </div>
            </div>

            {/* Встроенное раскрывающееся облако полного комментария */}
            {hasComment && showFullComment && (
              <div className="bg-blue-50/60 border border-blue-100/50 p-2.5 rounded-xl text-xs font-medium text-gray-700 shadow-2xs animate-in fade-in slide-in-from-top-1 duration-150 break-words relative">
                <button
                  onClick={() => setShowFullComment(false)}
                  className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                >
                  <X size={12} />
                </button>
                <p className="pr-4 leading-relaxed">{meal.meal_name}</p>
              </div>
            )}
          </div>

          {/* Список продуктов */}
          <div className="space-y-1.5">
            {(meal.items as SelectedProduct[]).map((item, idx) => (
              <div
                key={item.id || item.food_id || idx}
                className="flex justify-between items-center text-xs bg-white p-2.5 rounded-xl border border-gray-100 shadow-2xs group"
              >
                <div className="flex items-center gap-2 min-w-0">
                  {onRemoveItem && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const productId = item.id || item.food_id;
                        if (productId) {
                          onRemoveItem({
                            mealId: meal.id,
                            productId: productId,
                          });
                        }
                      }}
                      className="w-5 h-5 flex items-center justify-center rounded-full bg-red-50 text-red-400 md:opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white shrink-0"
                    >
                      <X size={10} />
                    </button>
                  )}

                  <div className="text-left min-w-0">
                    <p className="font-bold text-gray-700 truncate">
                      {item.name}
                    </p>
                    <p className="text-[10px] text-gray-400 font-medium flex items-center gap-0.5 mt-0.5">
                      <Scale size={9} /> {item.weight}г
                    </p>
                  </div>
                </div>

                <div className="font-black text-gray-900 text-right shrink-0 pl-2">
                  {Math.round((item.kcal / 100) * item.weight)}{" "}
                  <span className="text-[8px] text-gray-400 uppercase font-bold">
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
