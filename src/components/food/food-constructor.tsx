"use client";

import { useState, useEffect } from "react";
import { useProductSearch } from "@/hooks/use-product-search";
import { useMealStore } from "@/store/useMealStore";
import { useSaveMeal } from "@/hooks/use-save-meal";
import { SearchPanel } from "@/components/food/search-panel";
import { ConstructorList } from "@/components/food/constructor-list";
import { SummaryCard } from "@/components/food/summary-card";
import { ChevronLeft } from "lucide-react";

interface FoodConstructorProps {
  serverToday: string;
}

const MEAL_LABELS: Record<string, string> = {
  breakfast: "Завтрак",
  lunch: "Обед",
  dinner: "Ужин",
  snack: "Перекус",
};

export default function FoodConstructor({ serverToday }: FoodConstructorProps) {
  const [query, setQuery] = useState<string>("");
  const [comment, setComment] = useState<string>("");

  // Атомарные селекторы Zustand для исключения паразитных ререндеров
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

  // Важный UX: Блокировка прокрутки основного экрана при открытом конструкторе
  useEffect(() => {
    if (activeMealType) {
      document.body.classList.add("overflow-hidden");
    }
    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [activeMealType]);

  // Безопасный выход, если слой неактивен
  if (!activeMealType) return null;

  const currentLabel = MEAL_LABELS[activeMealType] || "Прием пищи";

  const handleClose = () => {
    setMealType(null);
    clearItems();
    setQuery("");
    setComment("");
  };

  const handleSaveMeal = async () => {
    await saveMeal(comment);
    setMealType(null); // Автоматически закрываем оверлей после успешного сохранения
    clearItems(); // Очищаем стейт выбранных продуктов
    setComment(""); // Сбрасываем комментарий к блюду
    setQuery(""); // Очищаем строку поиска
  };

  return (
    /* Внешняя обертка в стиле страниц личного кабинета с плавной анимацией появления */
    <div className="space-y-8 animate-in fade-in duration-300 text-slate-900">
      {/* ВЕРХНЯЯ СЕКЦИЯ: Шапка конструктора */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/60 pb-6">
        <button
          onClick={handleClose}
          className="flex items-center gap-2 text-slate-400 hover:text-slate-900 font-black text-xs transition-colors uppercase tracking-widest bg-white border border-slate-200 shadow-sm px-4 py-2.5 rounded-xl hover:border-slate-300 active:scale-95 duration-200"
        >
          <ChevronLeft size={14} /> Назад в дневник
        </button>

        <span className="px-5 py-2.5 rounded-xl bg-slate-950 text-white text-[10px] font-black uppercase tracking-[0.2em] w-fit shadow-sm">
          Режим ввода: {currentLabel}
        </span>
      </div>

      {/* ОСНОВНАЯ СЕТКА: Поиск слева, Конструктор справа */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Левая панель: Поиск и выдача продуктов (занимает 5 колонок из 12) */}
        <div className="lg:col-span-5">
          <SearchPanel
            query={query}
            setQuery={setQuery}
            results={results}
            isLoading={isSearching}
            onAddItem={addItem}
          />
        </div>

        {/* Правая панель: Список выбранного и КБЖУ (занимает 7 колонок из 12) */}
        <div className="lg:col-span-7 bg-white p-6 md:p-8 rounded-[32px] border border-slate-100 shadow-sm">
          <ConstructorList
            items={selectedItems}
            onUpdateWeight={updateWeight}
            onRemoveItem={removeItem}
          />

          {/* Карточка суммирования КБЖУ и кнопка сохранения */}
          {selectedItems.length > 0 && (
            <SummaryCard
              totals={getTotal()}
              mealName={comment}
              setMealName={setComment}
              onSave={handleSaveMeal}
              isPending={isPending}
            />
          )}
        </div>
      </div>
    </div>
  );
}
