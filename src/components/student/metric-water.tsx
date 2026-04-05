import { MetricCard } from "./metric-card";
import { Droplets } from "lucide-react";

interface MetricWaterProps {
  value: number;
  onAdd: () => void;
}

export default function MetricWater({ value, onAdd }: MetricWaterProps) {
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
      <div className="text-2xl font-black italic text-blue-600 mb-2">
        {value} мл
      </div>
      <button
        onClick={onAdd}
        className="w-full py-2 bg-white text-blue-600 rounded-xl font-black text-[10px] uppercase border border-blue-100 hover:bg-blue-50 transition-colors"
      >
        + 250 мл
      </button>
    </MetricCard>
  );
}
