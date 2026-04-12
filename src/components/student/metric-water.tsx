import { MetricCard } from "./metric-card";
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
    <MetricCard
      title="Вода"
      icon={Droplets}
      colorClass={{
        bg: "bg-blue-50/50",
        border: "border-blue-100",
        iconBg: "bg-blue-500",
        text: "text-blue-400",
      }}
    >
      <div className="text-2xl font-black italic text-blue-600 mb-2 leading-none">
        {value} <span className="text-[10px] not-italic opacity-60">мл</span>
      </div>

      <div className="flex gap-2 w-full">
        {/* Кнопка Убавить */}
        <button
          onClick={onRemove}
          disabled={value <= 0}
          className="flex-1 py-2 bg-white text-blue-600 rounded-xl font-black border border-blue-100 hover:bg-blue-50 transition-colors flex justify-center items-center disabled:opacity-30"
        >
          <Minus size={14} strokeWidth={3} />
        </button>

        {/* Кнопка Прибавить */}
        <button
          onClick={onAdd}
          className="flex-2 py-2 bg-blue-500 text-white rounded-xl font-black text-[10px] uppercase hover:bg-blue-600 transition-colors flex justify-center items-center gap-1 px-3"
        >
          <Plus size={14} strokeWidth={3} />
          <span>250</span>
        </button>
      </div>
    </MetricCard>
  );
}
