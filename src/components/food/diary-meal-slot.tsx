"use client";

import { useState, memo } from "react";
import { formatMealTime } from "@/lib/utils/date-utils";
import { DiaryMealSlotProps, SelectedProduct } from "@/types/food";
import {
  Plus,
  ChevronDown,
  ChevronUp,
  Trash2,
  Check,
  X,
  Scale,
  Utensils,
} from "lucide-react";

function DiaryMealSlotComponent({
  slot,
  savedMeal,
  isExpanded,
  isFormActiveForThisSlot,
  onToggle,
  onPlusClick,
  onRemoveItem,
  onDeleteMeal,
  onCloseSlot,
}: DiaryMealSlotProps) {
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  const handleToggleClick = () => {
    if (isExpanded) {
      setIsConfirmingDelete(false);
    }
    onToggle(slot.id);
  };

  const handlePlusBtnClick = (e: React.MouseEvent) => {
    onPlusClick(e);
  };

  const handleConfirmDeleteClick = () => {
    if (savedMeal) {
      onDeleteMeal(savedMeal.id);
      setIsConfirmingDelete(false);
      onCloseSlot(slot.id);
    }
  };

  return (
    <div
      className={`bg-white border transition-all duration-300 rounded-[32px] overflow-hidden ${
        isFormActiveForThisSlot
          ? "ring-2 ring-slate-950 border-transparent shadow-xl translate-y-[-2px]"
          : "border-slate-100 shadow-sm hover:border-slate-200"
      }`}
    >
      {/* Шапка слота еды */}
      <div
        onClick={handleToggleClick}
        className="p-6 cursor-pointer select-none flex justify-between items-center hover:bg-slate-50/40 transition-colors"
      >
        <div className="text-left space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="font-black text-xl text-slate-900 uppercase tracking-tighter">
              {slot.label}
            </h3>
            {savedMeal && (
              <span className="text-[9px] font-black text-slate-400 bg-slate-100 border border-slate-200/50 px-2 py-0.5 rounded-full uppercase">
                {formatMealTime(savedMeal.created_at)}
              </span>
            )}
          </div>

          {savedMeal ? (
            <div className="flex gap-2 pt-1">
              <span className="text-[9px] font-black text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded uppercase">
                Б: {savedMeal.total_p.toFixed(0)}
              </span>
              <span className="text-[9px] font-black text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded uppercase">
                Ж: {savedMeal.total_f.toFixed(0)}
              </span>
              <span className="text-[9px] font-black text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded uppercase">
                У: {savedMeal.total_c.toFixed(0)}
              </span>
            </div>
          ) : (
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Слот пуст
            </p>
          )}
        </div>

        <div
          className="flex items-center gap-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="text-right leading-none">
            <span className="text-2xl font-black text-slate-900 italic">
              {savedMeal ? Math.round(savedMeal.total_kcal) : 0}
            </span>
            <span className="text-[9px] text-slate-400 ml-1 uppercase font-black">
              ккал
            </span>
          </div>

          <button
            onClick={handlePlusBtnClick}
            className={`p-2 rounded-full transition-all ${
              isFormActiveForThisSlot
                ? "bg-emerald-500 text-white rotate-45 shadow-md"
                : "bg-slate-950 text-white hover:scale-105 shadow-sm"
            }`}
          >
            <Plus size={16} />
          </button>

          <button
            onClick={handleToggleClick}
            className="text-slate-300 hover:text-slate-900 transition-colors"
          >
            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        </div>
      </div>

      {/* Список продуктов */}
      {isExpanded && (
        <div className="px-6 pb-6 bg-slate-50/50 border-t border-slate-100/60 animate-in slide-in-from-top-2 duration-300">
          {!savedMeal || savedMeal.items.length === 0 ? (
            <div className="py-8 text-center text-xs font-medium text-slate-400 italic">
              В этот прием пищи еще ничего не добавлено
            </div>
          ) : (
            <div className="space-y-2 pt-4">
              {savedMeal.meal_name && (
                <p className="text-xs font-bold text-slate-400 flex items-center gap-1.5 mb-2 px-1">
                  <Utensils size={12} className="text-slate-300" />
                  {savedMeal.meal_name}
                </p>
              )}

              {(savedMeal.items as SelectedProduct[]).map((item, idx) => {
                const productId = item.id || item.food_id;
                return (
                  <div
                    key={productId || idx}
                    className="flex justify-between items-center text-sm bg-white p-4 rounded-[20px] border border-slate-100 shadow-sm group"
                  >
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => {
                          if (productId) {
                            onRemoveItem({ mealId: savedMeal.id, productId });
                            if (savedMeal.items.length <= 1) {
                              onCloseSlot(slot.id);
                            }
                          }
                        }}
                        className="w-6 h-6 flex items-center justify-center rounded-full bg-red-50 text-red-400 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white"
                      >
                        <X size={12} />
                      </button>

                      <div className="text-left">
                        <p className="font-bold text-slate-700">{item.name}</p>
                        <p className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                          <Scale size={10} /> {item.weight}г
                        </p>
                      </div>
                    </div>

                    <div className="font-black text-slate-900 text-right">
                      {Math.round((item.kcal / 100) * item.weight)}{" "}
                      <span className="text-[9px] text-slate-400 uppercase">
                        ккал
                      </span>
                    </div>
                  </div>
                );
              })}

              <div className="flex justify-end pt-2">
                {isConfirmingDelete ? (
                  <div className="flex items-center gap-1 bg-red-50 p-1 rounded-xl border border-red-100 animate-in zoom-in-95 duration-200">
                    <button
                      onClick={handleConfirmDeleteClick}
                      className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg text-xs font-black uppercase flex items-center gap-1"
                    >
                      <Check size={14} /> Удалить весь {slot.label}
                    </button>
                    <button
                      onClick={() => setIsConfirmingDelete(false)}
                      className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsConfirmingDelete(true)}
                    className="text-slate-300 hover:text-red-500 transition-colors text-[10px] font-black uppercase tracking-wider flex items-center gap-1 p-2"
                  >
                    <Trash2 size={12} /> Очистить
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Кастомный компаратор для идеальной мемоизации слотов еды
export const DiaryMealSlot = memo(
  DiaryMealSlotComponent,
  (prevProps, nextProps) => {
    return (
      prevProps.isExpanded === nextProps.isExpanded &&
      prevProps.isFormActiveForThisSlot === nextProps.isFormActiveForThisSlot &&
      prevProps.slot.id === nextProps.slot.id &&
      prevProps.savedMeal?.id === nextProps.savedMeal?.id &&
      prevProps.savedMeal?.total_kcal === nextProps.savedMeal?.total_kcal &&
      prevProps.savedMeal?.items.length === nextProps.savedMeal?.items.length
    );
  },
);
