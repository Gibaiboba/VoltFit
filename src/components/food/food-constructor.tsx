"use client";

import { useState } from "react";
import { useProductSearch } from "@/hooks/use-product-search";
import { useMealStore } from "@/store/useMealStore";
import { useSaveMeal } from "@/hooks/use-save-meal";
import { SearchPanel } from "@/components/food/search-panel";
import { ConstructorList } from "@/components/food/constructor-list";
import { SummaryCard } from "@/components/food/summary-card";
import { X } from "lucide-react";

interface FoodConstructorProps {
  serverToday: string;
  onClose?: () => void;
}

const MEAL_LABELS: Record<string, string> = {
  breakfast: "Завтрак",
  lunch: "Обед",
  dinner: "Ужин",
  snack: "Перекус",
};

export default function FoodConstructor({
  serverToday,
  onClose,
}: FoodConstructorProps) {
  const [query, setQuery] = useState<string>("");
  const [comment, setComment] = useState<string>("");

  // Атомарные селекторы Zustand
  const selectedItems = useMealStore((state) => state.selectedItems);
  const addItem = useMealStore((state) => state.addItem);
  const removeItem = useMealStore((state) => state.removeItem);
  const updateWeight = useMealStore((state) => state.updateWeight);
  const getTotal = useMealStore((state) => state.getTotal);
  const activeMealType = useMealStore((state) => state.activeMealType);
  const setMealType = useMealStore((state) => state.setMealType);
  const clearItems = useMealStore((state) => state.clearItems);

  const { data: results = [], isLoading: isSearching } =
    useProductSearch(query);
  const { saveMeal, isPending } = useSaveMeal(serverToday);

  if (!activeMealType) return null;

  const currentLabel = MEAL_LABELS[activeMealType] || "Прием пищи";

  const handleClose = () => {
    if (onClose) {
      onClose(); // Это вызовет handleProgrammaticClose на странице DiaryPage
    } else {
      setMealType(null);
      clearItems();
    }
    setQuery("");
    setComment("");
  };

  // ИСПРАВЛЕНО: При успешном сохранении тоже эмулируем правильный выход из оверлея
  const handleSaveMeal = async () => {
    saveMeal(comment);
    if (onClose) {
      onClose(); // Уведомит историю браузера и закроет аккордеоны
    } else {
      setMealType(null);
      clearItems();
    }
    setComment("");
    setQuery("");
  };

  return (
    // 1. Делаем контейнер фиксированным на весь экран, добавляем фон и overflow-y-auto для скролла
    <div className="fixed inset-0 z-50 bg-[#F4F4F5] overflow-y-auto px-4 py-6 sm:p-6 animate-in fade-in zoom-in-95 duration-200 text-slate-900">
      {/* 2. Ограничиваем максимальную ширину контента внутри оверлея */}
      <div className="max-w-4xl mx-auto space-y-6 pb-12">
        {/* ШАПКА */}
        <div className="flex items-center justify-between gap-2 pb-2">
          <button
            onClick={handleClose}
            className="flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all bg-white border border-slate-200 shadow-sm p-2.5 rounded-xl hover:border-slate-300 active:scale-95 duration-200"
            aria-label="Закрыть"
          >
            <X size={26} strokeWidth={2.5} />
          </button>

          <span className="px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] italic">
            {currentLabel}
          </span>
        </div>

        {/* СЕКЦИЯ 1: Панель поиска */}
        <section>
          <div className="bg-white p-5 sm:p-6 rounded-[24px] border border-slate-100 shadow-sm">
            <SearchPanel
              query={query}
              setQuery={setQuery}
              results={results}
              isLoading={isSearching}
              onAddItem={addItem}
            />
          </div>
        </section>

        {/* КОНСТРУКТОР */}
        {!query && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* СЕКЦИЯ 2: Панель итогов */}
            {selectedItems.length > 0 && (
              <section className="bg-white p-5 sm:p-6 rounded-[24px] border border-slate-100 shadow-sm">
                <SummaryCard
                  totals={getTotal()}
                  mealName={comment}
                  setMealName={setComment}
                  onSave={handleSaveMeal}
                  isPending={isPending}
                />
              </section>
            )}

            {/* СЕКЦИЯ 3: Список добавленных продуктов */}
            <section className="bg-white p-5 sm:p-6 rounded-[24px] border border-slate-100 shadow-sm space-y-4">
              {selectedItems.length > 0 ? (
                <ConstructorList
                  items={selectedItems}
                  onUpdateWeight={updateWeight}
                  onRemoveItem={removeItem}
                />
              ) : (
                <div className="py-8 text-center space-y-2">
                  <div className="text-3xl">🥗</div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Список пуст
                  </p>
                  <p className="text-[11px] text-slate-400 max-w-[240px] mx-auto">
                    Найдите и добавьте продукты через поиск выше
                  </p>
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
