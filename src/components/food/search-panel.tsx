import { Search, Loader2, Database, Utensils, Plus } from "lucide-react";
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
  return (
    <div className="lg:col-span-5 space-y-6">
      {/* Шапка поиска */}
      <div className="space-y-2 text-left">
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">
          Конструктор
        </h1>
        <p className="text-slate-400 text-sm font-medium">
          Найдите продукты в базе данных
        </p>
      </div>

      {/* Поле ввода */}
      <div className="relative group">
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors"
          size={20}
        />
        <input
          type="text"
          className="w-full pl-12 pr-12 py-5 bg-white border border-slate-100 rounded-[28px] shadow-sm focus:ring-4 focus:ring-blue-50 focus:border-blue-200 outline-none transition-all font-bold text-slate-700 placeholder:text-slate-300"
          placeholder="Начните вводить название..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {isLoading && (
          <Loader2
            className="absolute right-5 top-1/2 -translate-y-1/2 animate-spin text-blue-500"
            size={20}
          />
        )}
      </div>

      {/* Список результатов */}
      <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
        {results.map((product) => (
          <div
            key={product.id}
            className="flex items-center justify-between p-5 bg-white border border-slate-100 rounded-[24px] hover:border-blue-200 hover:shadow-md transition-all group"
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
