"use client";

import { useState } from "react";
import { useProductSearch } from "@/hooks/use-product-search";
import { useMealStore } from "@/store/useMealStore";

// Импортируем наши новые части
import { useSaveMeal } from "@/hooks/use-save-meal";
import { SearchPanel } from "@/components/food/search-panel";
import { ConstructorList } from "@/components/food/constructor-list";
import { SummaryCard } from "@/components/food/summary-card";

export default function FoodConstructor({
  serverToday,
}: {
  serverToday: string;
}) {
  // 1. Состояние для ввода
  const [query, setQuery] = useState<string>("");
  const [mealName, setMealName] = useState<string>("");

  // 2. Данные из поиска (React Query)
  const { data: results = [], isLoading: isSearching } =
    useProductSearch(query);

  // 3. Данные и методы из Zustand
  const { selectedItems, addItem, removeItem, updateWeight, getTotal } =
    useMealStore();

  // 4. Наш кастомный хук для сохранения в Supabase
  const { saveMeal, isPending } = useSaveMeal(serverToday);

  return (
    <div className="mt-24 max-w-6xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
      {/* ЛЕВАЯ ПАНЕЛЬ: ПОИСК */}
      <SearchPanel
        query={query}
        setQuery={setQuery}
        results={results}
        isLoading={isSearching}
        onAddItem={addItem}
      />

      {/* ПРАВАЯ ПАНЕЛЬ: КОНСТРУКТОР */}
      <div className="lg:col-span-7 bg-white p-8 rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/50">
        {/* Список ингредиентов */}
        <ConstructorList
          items={selectedItems}
          onUpdateWeight={updateWeight}
          onRemoveItem={removeItem}
        />

        {/* Итоги и кнопка сохранения (показываем, только если есть продукты) */}
        {selectedItems.length > 0 && (
          <SummaryCard
            totals={getTotal()}
            mealName={mealName}
            setMealName={setMealName}
            onSave={() => saveMeal(mealName)}
            isPending={isPending}
          />
        )}
      </div>
    </div>
  );
}
