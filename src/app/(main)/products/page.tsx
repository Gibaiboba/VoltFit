"use client";

import { useState, useEffect, ChangeEvent } from "react";
import { supabase } from "@/lib/supabase";
import { useMealStore } from "@/store/useMealStore";
import { Product } from "@/types/food";
import { Plus, Trash2, Scale, Loader2, Database, Save } from "lucide-react";

export default function FoodConstructor() {
  const [query, setQuery] = useState<string>("");
  const [results, setResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const {
    selectedItems,
    addItem,
    removeItem,
    updateWeight,
    getTotal,
    saveMeal,
  } = useMealStore();
  const totals = getTotal();

  useEffect(() => {
    const search = async () => {
      const trimmedQuery = query.trim();
      if (trimmedQuery.length < 2) {
        setResults([]);
        return;
      }

      setIsSearching(true);

      const { data, error } = await supabase
        .from("products")
        .select("id, name, kcal, proteins, fat, carbs")
        .ilike("name", `%${trimmedQuery}%`)
        .limit(10);

      if (!error && data) {
        setResults(data as Product[]);
      } else {
        setResults([]);
      }

      setIsSearching(false);
    };

    const timer = setTimeout(search, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const handleWeightChange = (id: string, e: ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    updateWeight(id, value);
  };

  const handleSaveMeal = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Пожалуйста, войдите в систему, чтобы сохранить блюдо");
      return;
    }

    setIsSaving(true);
    try {
      const result = await saveMeal(supabase, user.id);

      if (result.success) {
        alert("Блюдо успешно сохранено в вашу историю!");
      } else {
        alert(`Ошибка при сохранении: ${result.error}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mt-20 max-w-5xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-5 border-r pr-0 lg:pr-8">
        <div className="relative mb-6">
          <input
            type="text"
            className="w-full p-4 border rounded-2xl bg-gray-50 focus:ring-2 focus:ring-blue-400 outline-none transition-all"
            placeholder="Начните вводить название..."
            value={query}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setQuery(e.target.value)
            }
          />
          {isSearching && (
            <Loader2 className="absolute right-4 top-4 animate-spin text-gray-400" />
          )}
        </div>

        <div className="space-y-3">
          {results.map((product) => (
            <div
              key={product.id}
              className="flex items-center justify-between p-4 border rounded-xl hover:bg-blue-50 transition-all group"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-gray-800">{product.name}</p>
                  <span title="Наша база">
                    <Database size={12} className="text-blue-400" />
                  </span>
                </div>
                <p className="text-sm text-gray-500">
                  {product.kcal} ккал / 100г
                </p>
              </div>
              <button
                onClick={() => {
                  addItem(product);
                  setQuery("");
                }}
                className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow-sm active:scale-95"
              >
                <Plus size={18} />
              </button>
            </div>
          ))}
          {query.length >= 2 && results.length === 0 && !isSearching && (
            <p className="text-center text-gray-400 mt-4 text-sm italic">
              Ничего не найдено в базе...
            </p>
          )}
        </div>
      </div>

      <div className="lg:col-span-7 bg-gray-50 p-6 rounded-3xl border border-gray-100">
        <h2 className="text-2xl font-black mb-6">Ваше блюдо</h2>
        <div className="space-y-4 mb-8">
          {selectedItems.map((item) => (
            <div
              key={item.id}
              className="bg-white p-4 rounded-xl shadow-sm flex items-center gap-4"
            >
              <div className="flex-1">
                <p className="font-bold">{item.name}</p>
                <p className="text-xs text-gray-400">
                  Б: {(item.proteins * (item.weight / 100)).toFixed(1)} | Ж:{" "}
                  {(item.fat * (item.weight / 100)).toFixed(1)} | У:{" "}
                  {(item.carbs * (item.weight / 100)).toFixed(1)}
                </p>
              </div>
              <div className="flex items-center bg-gray-100 rounded-lg px-2 py-1">
                <Scale size={14} className="text-gray-400 mr-1" />
                <input
                  type="number"
                  value={item.weight}
                  onChange={(e) => handleWeightChange(item.id, e)}
                  className="w-14 bg-transparent outline-none font-bold text-center"
                />
                <span className="text-[10px] text-gray-400">г</span>
              </div>
              <button
                onClick={() => removeItem(item.id)}
                className="text-red-400 hover:text-red-600"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>

        {selectedItems.length > 0 && (
          <>
            <div className="bg-blue-600 p-6 rounded-2xl text-white shadow-xl">
              <div className="flex justify-between items-end mb-4">
                <span className="opacity-80 uppercase text-xs font-bold tracking-widest">
                  Всего калорий
                </span>
                <span className="text-4xl font-black">
                  {Math.round(totals.kcal)}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-4 border-t border-blue-400/50 text-center">
                <div>
                  <p className="text-[10px] opacity-70 uppercase">Белки</p>
                  <p className="font-bold">{totals.p.toFixed(1)}г</p>
                </div>
                <div>
                  <p className="text-[10px] opacity-70 uppercase">Жиры</p>
                  <p className="font-bold">{totals.f.toFixed(1)}г</p>
                </div>
                <div>
                  <p className="text-[10px] opacity-70 uppercase">Углеводы</p>
                  <p className="font-bold">{totals.c.toFixed(1)}г</p>
                </div>
              </div>
            </div>

            <button
              onClick={handleSaveMeal}
              disabled={isSaving}
              className="w-full mt-6 flex items-center justify-center gap-2 py-4 bg-green-500 hover:bg-green-600 text-white font-bold rounded-2xl shadow-lg transition-all active:scale-[0.98] disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <Save size={20} />
              )}
              {isSaving ? "Сохраняем..." : "Сохранить в историю питания"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
