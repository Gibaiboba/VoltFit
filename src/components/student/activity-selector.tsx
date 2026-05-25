import { Plus } from "lucide-react";
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
    <div className="space-y-2 w-full group">
      {/* Лейбл */}
      <div className="flex items-center gap-2 ml-1">
        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
          Уровень активности
        </label>
      </div>

      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full p-4 bg-white border border-slate-100 
                     text-slate-700 font-bold text-sm rounded-2xl outline-none 
                     appearance-none cursor-pointer pr-12 transition-all shadow-sm
                     hover:border-slate-200 focus:border-slate-300 focus:bg-slate-50/50"
        >
          {ACTIVITY_OPTIONS.map((opt) => (
            <option
              key={opt}
              value={opt}
              className="bg-white text-slate-700 font-medium"
            >
              {opt}
            </option>
          ))}
        </select>

        {/* Вместо стрелочки теперь плюсик в стиле кнопки добавления воды */}
        <div
          className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none 
                        bg-slate-50 p-1.5 rounded-xl border border-slate-100/50
                        group-hover:bg-slate-100 transition-all duration-200"
        >
          <Plus
            className="text-slate-400 w-4 h-4 transition-transform group-hover:rotate-90"
            strokeWidth={2.5}
          />
        </div>
      </div>
    </div>
  );
}
