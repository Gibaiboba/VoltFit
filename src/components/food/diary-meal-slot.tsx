"use client";

import { useState, memo } from "react";
import { DiaryMealSlotProps, SelectedProduct } from "@/types/food";
import {
  Plus,
  ChevronDown,
  ChevronUp,
  Trash2,
  Check,
  X,
  Scale,
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
      className={`bg-white border transition-all duration-300 rounded-2xl overflow-hidden ${
        isFormActiveForThisSlot
          ? "border-slate-900 shadow-[0_8px_30px_rgb(0,0,0,0.06)] translate-y-[-1px]"
          : "border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:border-slate-200/80 hover:shadow-[0_4px_16px_rgba(0,0,0,0.04)]"
      }`}
    >
      {/* Шапка слота еды */}
      <div
        onClick={handleToggleClick}
        className="p-5 cursor-pointer select-none flex justify-between items-center hover:bg-slate-50/50 transition-colors"
      >
        <div className="text-left space-y-1.5">
          <h3 className="font-semibold text-lg text-slate-900 tracking-tight">
            {slot.label}
          </h3>

          {savedMeal ? (
            <div className="flex items-center gap-3 text-xs font-medium text-slate-500">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                Б: {savedMeal.total_p.toFixed(0)}
              </span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                Ж: {savedMeal.total_f.toFixed(0)}
              </span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                У: {savedMeal.total_c.toFixed(0)}
              </span>
            </div>
          ) : (
            <p className="text-xs text-slate-400 font-normal">Пустой слот</p>
          )}
        </div>

        <div
          className="flex items-center gap-3.5"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="text-right">
            <span className="text-xl font-bold text-slate-900 tracking-tight">
              {savedMeal ? Math.round(savedMeal.total_kcal) : 0}
            </span>
            <span className="text-xs text-slate-400 ml-1 font-normal">
              ккал
            </span>
          </div>

          <button
            onClick={handlePlusBtnClick}
            className={`p-2 rounded-xl transition-all duration-200 ${
              isFormActiveForThisSlot
                ? "bg-emerald-500 text-white rotate-45 shadow-sm shadow-emerald-200"
                : "bg-slate-50 text-slate-900 hover:bg-slate-900 hover:text-white"
            }`}
          >
            <Plus size={16} className="transition-transform duration-200" />
          </button>

          <button
            onClick={handleToggleClick}
            className={`p-1 text-slate-400 hover:text-slate-900 transition-all rounded-lg hover:bg-slate-50 ${
              isExpanded ? "rotate-0" : ""
            }`}
          >
            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>
      </div>

      {/* Список продуктов */}
      {isExpanded && (
        <div className="px-5 pb-5 bg-slate-50/30 border-t border-slate-100/80 animate-in fade-in slide-in-from-top-1 duration-200">
          {!savedMeal || savedMeal.items.length === 0 ? (
            <div className="py-8 text-center text-sm text-slate-400/80 font-normal">
              В этот прием пищи еще ничего не добавлено
            </div>
          ) : (
            <div className="space-y-1.5 pt-4">
              {(savedMeal.items as SelectedProduct[]).map((item, idx) => {
                const productId = item.id || item.food_id;
                return (
                  <div
                    key={productId || idx}
                    className="flex justify-between items-center text-sm bg-white p-3.5 rounded-xl border border-slate-100/70 shadow-[0_1px_3px_rgba(0,0,0,0.01)] group relative overflow-hidden"
                  >
                    {/* Контейнер с контентом: на десктопе сдвигается, на мобилке нет */}
                    <div className="flex items-center gap-3 z-10 transition-transform duration-200 md:group-hover:translate-x-7">
                      {/* Кнопка удаления для МОБИЛЬНЫХ (видка до md-брейкпоинта) */}
                      <button
                        onClick={() => {
                          if (productId) {
                            onRemoveItem({ mealId: savedMeal.id, productId });
                            if (savedMeal.items.length <= 1) {
                              onCloseSlot(slot.id);
                            }
                          }
                        }}
                        className="w-7 h-7 flex md:hidden items-center justify-center rounded-lg bg-slate-50 text-slate-400 active:bg-rose-50 active:text-rose-500 transition-colors"
                      >
                        <X size={14} />
                      </button>

                      <div className="text-left">
                        <p className="font-medium text-slate-800 leading-tight">
                          {item.name}
                        </p>
                        <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                          <Scale size={11} className="text-slate-300" />{" "}
                          {item.weight} г
                        </p>
                      </div>
                    </div>

                    {/* Кнопка удаления для ДЕСКТОПА (выезжает при ховере, скрыта на мобильных через md:flex) */}
                    <button
                      onClick={() => {
                        if (productId) {
                          onRemoveItem({ mealId: savedMeal.id, productId });
                          if (savedMeal.items.length <= 1) {
                            onCloseSlot(slot.id);
                          }
                        }
                      }}
                      className="hidden md:flex absolute left-3 w-7 h-7 items-center justify-center rounded-lg bg-rose-50 text-rose-500 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 hover:bg-rose-500 hover:text-white"
                    >
                      <X size={14} />
                    </button>

                    <div className="font-semibold text-slate-900 text-right z-10 pl-2">
                      {Math.round((item.kcal / 100) * item.weight)}{" "}
                      <span className="text-xs text-slate-400 font-normal">
                        ккал
                      </span>
                    </div>
                  </div>
                );
              })}

              {/* Футер слота с кнопкой очистки */}
              <div className="flex justify-end pt-2">
                {isConfirmingDelete ? (
                  <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-sm animate-in zoom-in-95 duration-150">
                    <button
                      onClick={handleConfirmDeleteClick}
                      className="px-2.5 py-1.5 text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                    >
                      <Check size={14} /> Удалить всё
                    </button>
                    <button
                      onClick={() => setIsConfirmingDelete(false)}
                      className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsConfirmingDelete(true)}
                    className="text-slate-400 hover:text-rose-500 transition-colors text-xs font-medium flex items-center gap-1.5 p-1.5 rounded-lg hover:bg-slate-50"
                  >
                    <Trash2 size={13} />
                    Очистить все
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
