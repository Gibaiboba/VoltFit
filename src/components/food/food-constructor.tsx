"use client";

import { useState, useEffect } from "react";
import { useProductSearch } from "@/hooks/use-product-search";
import { useMealStore } from "@/store/useMealStore";
import { useSaveMeal } from "@/hooks/use-save-meal";
import { useMealHistory } from "@/hooks/use-meal-history";
import { SearchPanel } from "@/components/food/search-panel";
import { ConstructorList } from "@/components/food/constructor-list";
import { SummaryCard } from "@/components/food/summary-card";
import { MealType } from "@/types/food";
import { ChevronLeft, Plus } from "lucide-react";
import { toISODate } from "@/lib/utils/date-utils";
export default function FoodConstructor({
  serverToday,
}: {
  serverToday: string;
}) {
  const [query, setQuery] = useState<string>("");
  const [comment, setComment] = useState<string>("");

  // 1. Подгружаем историю за выбранный день
  const { meals: history } = useMealHistory(undefined, serverToday);

  const { data: results = [], isLoading: isSearching } =
    useProductSearch(query);

  const {
    selectedItems,
    addItem,
    removeItem,
    updateWeight,
    getTotal,
    activeMealType,
    setMealType,
    loadItems,
    clearItems,
  } = useMealStore();

  const { saveMeal, isPending } = useSaveMeal(serverToday);

  useEffect(() => {
    clearItems();
  }, [clearItems]);

  const mealSlots: { id: MealType; label: string }[] = [
    { id: "breakfast", label: "Завтрак" },
    { id: "lunch", label: "Обед" },
    { id: "dinner", label: "Ужин" },
    { id: "snack", label: "Перекус" },
  ];

  // логика выбора слота через toISODate
  const handleSelectSlot = (slotId: MealType) => {
    clearItems();
    setComment("");

    const existing = history.find((m) => {
      // Используем функцию для корректного сравнения дат с учетом часового пояса
      const mealDate = toISODate(new Date(m.created_at));
      return m.meal_type === slotId && mealDate === serverToday;
    });

    if (existing) {
      loadItems(existing.items, slotId, existing.id);
      setComment(existing.meal_name || "");
    } else {
      setMealType(slotId);
    }
  };

  if (!activeMealType) {
    return (
      <div className="mt-32 max-w-2xl mx-auto p-6">
        <h2 className="text-2xl font-black text-slate-900 mb-8 text-center uppercase tracking-tighter">
          Выберите прием пищи
        </h2>
        <div className="grid grid-cols-1 gap-4">
          {mealSlots.map((slot) => {
            // Исправленный поиск для отображения калорий на кнопках
            const saved = history.find((m) => {
              const mealDate = toISODate(new Date(m.created_at));
              return m.meal_type === slot.id && mealDate === serverToday;
            });

            return (
              <button
                key={slot.id}
                onClick={() => handleSelectSlot(slot.id)}
                className="flex items-center justify-between p-6 rounded-3xl bg-white border border-slate-100 shadow-sm hover:border-slate-300 transition-all group"
              >
                <div className="flex flex-col items-start text-left">
                  <span className="font-bold text-slate-800 uppercase tracking-widest text-sm">
                    {slot.label}
                  </span>
                  {saved && (
                    <span className="text-xs font-bold text-emerald-500 mt-1">
                      {Math.round(saved.total_kcal)} ккал
                    </span>
                  )}
                </div>
                <div className="p-2 rounded-full bg-slate-900 text-white group-hover:scale-110 transition-transform">
                  <Plus size={20} />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  const currentLabel =
    mealSlots.find((s) => s.id === activeMealType)?.label || "Прием пищи";

  return (
    <div className="mt-24 max-w-6xl mx-auto p-6">
      <button
        onClick={() => {
          setMealType(null);
          clearItems();
          setQuery("");
        }}
        className="flex items-center gap-2 text-slate-400 hover:text-slate-900 mb-6 font-bold text-xs transition-colors uppercase tracking-widest"
      >
        <ChevronLeft size={14} /> Назад к выбору
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        <SearchPanel
          query={query}
          setQuery={setQuery}
          results={results}
          isLoading={isSearching}
          onAddItem={addItem}
        />

        <div className="lg:col-span-7 bg-white p-8 rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/50">
          <div className="mb-6">
            <span className="px-5 py-2 rounded-full bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em]">
              {currentLabel}
            </span>
          </div>

          <ConstructorList
            items={selectedItems}
            onUpdateWeight={updateWeight}
            onRemoveItem={removeItem}
          />

          {selectedItems.length > 0 && (
            <SummaryCard
              totals={getTotal()}
              mealName={comment}
              setMealName={setComment}
              onSave={() => saveMeal(comment)}
              isPending={isPending}
            />
          )}
        </div>
      </div>
    </div>
  );
}
