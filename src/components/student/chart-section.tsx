import ActivityVisualizer from "@/components/shared/ActivityVisualizer";
import { ChartPoint } from "@/components/shared/ActivityVisualizer";

interface ChartsSectionProps {
  chartData: {
    steps: ChartPoint[];
    calories: ChartPoint[];
  };
}

export default function ChartsSection({ chartData }: ChartsSectionProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <ActivityVisualizer
        title="👟 Активность"
        unit="шагов"
        data={chartData.steps}
        color="yellow" // Volt Yellow
      />
      <ActivityVisualizer
        title="🔥 Калории"
        unit="ккал"
        data={chartData.calories}
        color="cyan" // Volt Aqua/Cyan
      />
    </div>
  );
}
