import { ChevronDown } from "lucide-react";
import { ACTIVITY_OPTIONS } from "@/constants/activityOptions";

interface ActivitySelectorProps {
  value: string;
  onChange: (val: string) => void;
}

export default function ActivitySelector({
  value,
  onChange,
}: ActivitySelectorProps) {
  return (
    <div className="space-y-3 w-full group">
      {/* Лейбл в стиле VoltFit */}
      <div className="flex items-center gap-2 ml-1">
        <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
          Уровень активности
        </label>
      </div>

      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full p-5 bg-slate-950 border border-white/5 
                     text-yellow-400 font-black text-sm rounded-[1.5rem] outline-none 
                     appearance-none cursor-pointer pr-12 transition-all
                     hover:border-yellow-400/40 hover:shadow-[0_0_20px_rgba(250,204,21,0.1)]
                     focus:border-yellow-400 focus:ring-4 focus:ring-yellow-400/5"
        >
          {ACTIVITY_OPTIONS.map((opt) => (
            <option
              key={opt}
              value={opt}
              className="bg-slate-900 text-white font-bold"
            >
              {opt}
            </option>
          ))}
        </select>

        {/* Кастомная иконка стрелки в Volt-стиле */}
        <div
          className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none 
                        bg-white/5 p-1.5 rounded-xl border border-white/5
                        group-hover:border-yellow-400/50 transition-all duration-300"
        >
          <ChevronDown className="text-yellow-400 w-4 h-4" strokeWidth={3} />
        </div>
      </div>

      {/* Подсказка */}
      <div className="flex items-center gap-2 ml-1 opacity-50">
        <span className="text-[9px] font-black text-yellow-400/70 uppercase tracking-tighter italic">
          VoltFit Protocol
        </span>
        <div className="h-[1px] flex-1 bg-gradient-to-r from-yellow-400/20 to-transparent" />
      </div>
    </div>
  );
}
