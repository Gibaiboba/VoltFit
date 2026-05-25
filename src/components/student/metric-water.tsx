import { Droplets, Plus, Minus } from "lucide-react";

interface MetricWaterProps {
  value: number;
  onAdd: () => void;
  onRemove: () => void;
}

export default function MetricWater({
  value,
  onAdd,
  onRemove,
}: MetricWaterProps) {
  // Фирменный цвет воды (голубой)
  const waterColor = "#0ea5e9"; // Tailwind sky-500

  return (
    // Светлый фон карточки, мягкая тень shadow-sm и скругление [2.5rem]
    <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col items-center w-full transition-all">
      {/* Шапка: Иконка + Название в стиле предыдущих компонентов */}
      <div className="flex flex-col items-center gap-2 mb-4">
        <div
          className="w-12 h-12 rounded-2xl bg-sky-500/10 flex items-center justify-center border border-slate-50"
          style={{ boxShadow: `0 2px 6px rgba(14, 165, 233, 0.15)` }}
        >
          <Droplets className="w-6 h-6" style={{ color: waterColor }} />
        </div>
        <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">
          Вода
        </span>
      </div>

      {/* Крупные цифры с мягким свечением */}
      <div className="flex items-baseline justify-center mb-6">
        <span
          className="text-4xl font-black italic tracking-tighter"
          style={{
            color: waterColor,
            textShadow: `0 2px 6px ${waterColor}30`,
          }}
        >
          {value}
        </span>
        <span className="text-[10px] font-black uppercase text-slate-400 ml-1">
          мл
        </span>
      </div>

      {/* Кнопки управления */}
      <div className="flex gap-3 w-full">
        {/* Кнопка Убавить */}
        <button
          onClick={onRemove}
          disabled={value <= 0}
          className="flex-1 py-3.5 bg-slate-50 text-slate-400 rounded-2xl border border-slate-100 hover:bg-slate-100 hover:text-slate-600 active:scale-95 disabled:opacity-40 disabled:hover:bg-slate-50 disabled:hover:text-slate-400 disabled:active:scale-100 transition-all flex items-center justify-center"
        >
          <Minus size={18} strokeWidth={2.5} />
        </button>

        {/* Кнопка Прибавить */}
        <button
          onClick={onAdd}
          className="flex-[2] py-3.5 rounded-2xl font-bold text-[11px] uppercase tracking-wider active:scale-95 transition-all flex items-center justify-center gap-1.5"
          style={{
            color: waterColor,
            backgroundColor: `${waterColor}12`,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = `${waterColor}18`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = `${waterColor}12`;
          }}
        >
          <Plus size={14} strokeWidth={3} />
          <span>Добавить 250</span>
        </button>
      </div>
    </div>
  );
}
