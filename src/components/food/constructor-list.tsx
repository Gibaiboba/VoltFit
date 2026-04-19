import { Utensils, Scale, Trash2 } from "lucide-react";
import { SelectedProduct } from "@/types/food";

interface ConstructorListProps {
  items: SelectedProduct[];
  onUpdateWeight: (id: string, weight: number) => void;
  onRemoveItem: (id: string) => void;
}

export function ConstructorList({
  items,
  onUpdateWeight,
  onRemoveItem,
}: ConstructorListProps) {
  return (
    <div className="space-y-4 mb-10 min-h-[100px]">
      {/* Заголовок секции */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-black text-slate-800">Состав блюда</h2>
        <span className="px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest">
          {items.length} поз.
        </span>
      </div>

      {items.length === 0 ? (
        // Состояние пустой корзины
        <div className="py-16 text-center">
          <Utensils className="mx-auto text-slate-100 mb-4" size={64} />
          <p className="text-slate-300 font-medium italic">
            Ваше блюдо пока пусто...
          </p>
        </div>
      ) : (
        // Список выбранных продуктов
        items.map((item) => (
          <div
            key={item.id}
            className="bg-slate-50/50 p-5 rounded-3xl flex items-center gap-5 border border-slate-50 hover:bg-white hover:border-slate-100 transition-all"
          >
            <div className="flex-1 text-left">
              <p className="font-black text-slate-700 mb-1">{item.name}</p>
              <div className="flex gap-4">
                {/* Расчет нутриентов конкретно для этого веса */}
                <span className="text-[10px] font-black text-orange-400 uppercase">
                  Б: {(item.proteins * (item.weight / 100)).toFixed(1)}
                </span>
                <span className="text-[10px] font-black text-rose-400 uppercase">
                  Ж: {(item.fat * (item.weight / 100)).toFixed(1)}
                </span>
                <span className="text-[10px] font-black text-indigo-400 uppercase">
                  У: {(item.carbs * (item.weight / 100)).toFixed(1)}
                </span>
              </div>
            </div>

            {/* Поле ввода веса */}
            <div className="flex items-center bg-white shadow-sm border border-slate-100 rounded-2xl px-4 py-2">
              <Scale size={14} className="text-slate-300 mr-2" />
              <input
                type="number"
                value={item.weight}
                onChange={(e) =>
                  onUpdateWeight(
                    item.id,
                    Math.max(0, parseFloat(e.target.value) || 0),
                  )
                }
                className="w-16 bg-transparent outline-none font-black text-slate-700 text-center"
              />
              <span className="text-[10px] font-black text-slate-400 uppercase ml-1">
                г
              </span>
            </div>

            {/* Кнопка удаления */}
            <button
              onClick={() => onRemoveItem(item.id)}
              className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
            >
              <Trash2 size={20} />
            </button>
          </div>
        ))
      )}
    </div>
  );
}
