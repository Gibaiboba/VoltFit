import ActivityVisualizer from "@/components/shared/ActivityVisualizer";
import { ChartPoint } from "@/components/shared/ActivityVisualizer";

interface ChartsSectionProps {
  chartData: {
    steps: ChartPoint[]; // импортируемый интерфейс из ActivityVisualizer
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
        color="blue"
      />
      <ActivityVisualizer
        title="🔥 Калории"
        unit="ккал"
        data={chartData.calories}
        color="rose"
      />
    </div>
  );
}
