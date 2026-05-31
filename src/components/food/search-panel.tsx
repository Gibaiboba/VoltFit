import { useEffect, useRef } from "react";
import { Search, Loader2, Database, Utensils, Plus, X } from "lucide-react";
import { Product } from "@/types/food";

interface SearchPanelProps {
  query: string;
  setQuery: (val: string) => void;
  results: Product[];
  isLoading: boolean;
  onAddItem: (product: Product) => void;
}

export function SearchPanel({
  query,
  setQuery,
  results,
  isLoading,
  onAddItem,
}: SearchPanelProps) {
  // Ссылка на DOM-элемент инпута
  const inputRef = useRef<HTMLInputElement>(null);

  // Автофокус при монтировании компонента
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className="lg:col-span-5 space-y-6 relative group">
      {/* Поле ввода */}
      <Search
        className="absolute left-4 top-[31px] -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors z-10"
        size={20}
      />
      <input
        ref={inputRef} // Привязываем ссылку
        type="text"
        className="w-full pl-12 pr-12 py-5 bg-white border border-slate-100 rounded-[28px] shadow-sm focus:ring-4 focus:ring-blue-50 focus:border-blue-200 outline-none transition-all font-bold text-slate-700 placeholder:text-slate-300"
        placeholder="Начните вводить название..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {/* Правый блок: Лоадер ИЛИ Крестик очистки */}
      <div className="absolute right-5 top-[31px] -translate-y-1/2 z-10 flex items-center justify-center">
        {isLoading ? (
          <Loader2 className="animate-spin text-blue-500" size={20} />
        ) : (
          query && (
            <button
              onClick={() => {
                setQuery("");
                inputRef.current?.focus(); // Возвращаем фокус на инпут после очистки текста
              }}
              className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 active:scale-90 transition-all"
              type="button"
              aria-label="Очистить поиск"
            >
              <X size={20} strokeWidth={2.5} />
            </button>
          )
        )}
      </div>

      {/* Список результатов */}
      <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
        {results.map((product) => (
          <div
            key={product.id}
            className="flex items-center justify-between p-5 bg-white border border-slate-100 rounded-[24px] hover:border-blue-200 hover:shadow-md transition-all group/item"
          >
            <div className="flex-1 text-left">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-black text-slate-700 leading-tight">
                  {product.name}
                </p>
                <Database size={12} className="text-blue-300" />
              </div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {product.kcal} ккал / 100г
              </p>
            </div>
            <button
              onClick={() => {
                onAddItem(product);
                setQuery(""); // Очищаем поиск после добавления
                inputRef.current?.focus(); // Возвращаем фокус, чтобы можно было сразу искать следующий продукт
              }}
              className="p-3 bg-slate-50 text-slate-400 hover:bg-blue-600 hover:text-white rounded-2xl transition-all active:scale-90"
            >
              <Plus size={20} />
            </button>
          </div>
        ))}

        {/* Состояние "Ничего не найдено" */}
        {query.length >= 2 && results.length === 0 && !isLoading && (
          <div className="text-center py-10 bg-slate-50 rounded-[32px] border-2 border-dashed border-slate-100">
            <Utensils className="mx-auto text-slate-200 mb-2" size={32} />
            <p className="text-slate-400 text-sm italic">Ничего не нашли...</p>
          </div>
        )}
      </div>
    </div>
  );
}
