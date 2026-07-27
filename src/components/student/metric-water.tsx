import { Droplets, Plus, Minus } from "lucide-react";

interface MetricWaterProps {
  value: number;
  onAdd: () => void;
  onRemove: () => void;
  error?: string;
}

export default function MetricWater({
  value,
  onAdd,
  onRemove,
  error,
}: MetricWaterProps) {
  const waterColor = "#0ea5e9";

  return (
    <div
      className={`bg-white px-6 pt-5 pb-5 sm:pt-10 sm:pb-11 rounded-xl border border-slate-100 shadow-sm flex items-center justify-start gap-2 w-full transition-all hover:shadow-md hover:border-slate-200/60 ${error ? "border-red-100" : ""}`}
    >
      {/* Левая сторона: Иконка + Текст */}
      <div className="flex items-center gap-3 select-none">
        <div className="w-10 h-14 flex items-center justify-center shrink-0">
          <Droplets className="w-6 h-6" style={{ color: waterColor }} />
        </div>

        {/* БЛОК ЦИФР И ФУТЕРА */}
        <div className="flex flex-col gap-0.5 shrink-0">
          <span className="text-sm font-bold uppercase text-slate-400 tracking-wider">
            Вода
          </span>
          <div className="flex items-baseline gap-1">
            <div className="w-20 sm:w-24 flex pr-1 justify-end">
              <span
                className="text-2xl font-black italic tracking-tighter"
                style={{
                  color: waterColor,
                  textShadow: `0 2px 8px ${waterColor}20`,
                }}
              >
                {value}
              </span>
            </div>
            <span className="text-xs pl-1 font-black uppercase text-slate-400 w-6 shrink-0">
              мл
            </span>
          </div>
        </div>
      </div>

      {/* Правая сторона: Кнопки управления */}
      <div
        className={`relative flex gap-3 shrink-0 p-1.5 rounded-2xl transition-all border ${
          error ? "bg-red-50/20 border-red-200" : "border-transparent"
        }`}
      >
        {/* Минус */}
        <button
          onClick={onRemove}
          disabled={value <= 0}
          className="w-13 h-13 bg-slate-50 text-slate-400 rounded-xl border border-slate-100 hover:bg-slate-100 hover:text-slate-600 active:scale-95 disabled:opacity-40 disabled:hover:bg-slate-50 disabled:hover:text-slate-400 disabled:active:scale-100 transition-all flex items-center justify-center cursor-pointer"
        >
          <Minus size={18} strokeWidth={2.5} />
        </button>

        {/* Плюс 250мл */}
        <button
          onClick={onAdd}
          className="h-13 px-5 rounded-xl font-extrabold text-xs uppercase tracking-wider active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
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
          <Plus size={16} strokeWidth={3} />
          <span>+250 мл</span>
        </button>

        {error && (
          <span className="absolute top-[105%] right-2 text-[10px] font-bold text-red-500 tracking-wide whitespace-nowrap text-right animate-in fade-in slide-in-from-top-1 duration-150">
            {error}
          </span>
        )}
      </div>
    </div>
  );
}
