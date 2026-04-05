import { ChevronDown } from "lucide-react";
import { ACTIVITY_OPTIONS } from "@/constants/activityOptions";

interface ActivitySelectorProps {
  value: string;
  // Уточняем, что функция принимает строку и ничего не возвращает
  onChange: (val: string) => void;
}

export default function ActivitySelector({
  value,
  onChange,
}: ActivitySelectorProps) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">
        Уровень активности
      </label>
      <div className="relative group">
        <select
          value={value}
          // Извлекаем значение из события и передаем в колбэк
          onChange={(e) => onChange(e.target.value)}
          className="w-full p-4 bg-slate-50 border-2 border-transparent group-hover:bg-slate-100 focus:bg-white focus:border-blue-500 rounded-2xl outline-none font-bold transition-all appearance-none cursor-pointer pr-10 text-slate-700"
        >
          {ACTIVITY_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 w-5 h-5" />
      </div>
    </div>
  );
}
