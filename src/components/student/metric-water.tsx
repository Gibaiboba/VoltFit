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
  return (
    <div className="bg-slate-950 p-6 rounded-[2.5rem] border border-white/5 shadow-2xl flex flex-col items-center group">
      {/* Иконка с водным акцентом */}
      <div className="relative mb-4">
        <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center transition-all group-hover:shadow-[0_0_20px_rgba(6,182,212,0.2)]">
          <Droplets className="w-7 h-7 text-cyan-400 fill-cyan-400/20 animate-[pulse_3s_infinite]" />
        </div>
        {/* Декоративный блик за иконкой */}
        <div className="absolute inset-0 bg-cyan-400/5 blur-xl -z-10 rounded-full" />
      </div>

      <div className="text-5xl font-black italic text-yellow-400 mb-6 tracking-tighter">
        {value}
        <span className="text-xs not-italic ml-1 text-slate-500">ML</span>
      </div>

      <div className="flex gap-3 w-full">
        {/* Кнопка Убавить */}
        <button
          onClick={onRemove}
          disabled={value <= 0}
          className="flex-1 py-4 bg-slate-900 text-slate-500 rounded-2xl border border-white/5 active:scale-95 transition-all font-black hover:text-yellow-400 hover:border-yellow-400/20 disabled:opacity-20"
        >
          <Minus size={20} strokeWidth={3} />
        </button>

        {/* Кнопка Прибавить */}
        <button
          onClick={onAdd}
          className="flex-[2] py-4 bg-yellow-400 text-black rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-yellow-300 active:scale-95 shadow-[0_0_25px_rgba(250,204,21,0.25)] transition-all flex items-center justify-center gap-2"
        >
          <Plus size={16} strokeWidth={4} />
          <span>Добавить 250</span>
        </button>
      </div>
    </div>
  );
}
