"use client";
import { ResponsiveLine } from "@nivo/line";

export interface ChartPoint {
  x: string;
  y: number;
}

interface Props {
  title: string;
  unit: string;
  data: ChartPoint[];
  color: "blue" | "rose";
}

export default function ActivityVisualizer({
  title,
  unit,
  data,
  color,
}: Props) {
  const themeColor = color === "blue" ? "#3b82f6" : "#f43f5e";

  const nivoData = [
    {
      id: title,
      data: data.map((p) => ({
        // Форматируем дату для оси X
        x: p.x.split("-").reverse().slice(0, 2).join("."),
        y: p.y,
      })),
    },
  ];

  return (
    <div className="bg-white rounded-[32px] p-6 border border-slate-100 shadow-xl shadow-slate-200/50 h-[320px] flex flex-col">
      <div className="flex justify-between items-center mb-2 px-2">
        <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400">
          {title}
        </h3>
        <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">
          {unit}
        </span>
      </div>

      <div className="flex-1 min-h-0 w-full">
        <ResponsiveLine
          data={nivoData}
          margin={{ top: 20, right: 20, bottom: 40, left: 40 }}
          xScale={{ type: "point" }}
          yScale={{ type: "linear", min: "auto", max: "auto", stacked: false }}
          curve="monotoneX"
          axisTop={null}
          axisRight={null}
          axisBottom={{ tickSize: 0, tickPadding: 12 }}
          axisLeft={{ tickSize: 0, tickValues: 4, tickPadding: 12 }}
          enableGridX={false}
          colors={[themeColor]}
          lineWidth={4}
          pointSize={10}
          pointColor={themeColor}
          pointBorderWidth={3}
          pointBorderColor={{ from: "serieColor" }}
          useMesh={true}
          enableCrosshair={true}
          crosshairType="cross"
          tooltip={({ point }) => (
            <div className="bg-white p-3 shadow-xl border border-slate-100 rounded-2xl flex flex-col gap-1">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                Дата:{" "}
                <span className="text-slate-700">{point.data.xFormatted}</span>
              </div>
              <div className="text-sm font-black text-slate-800">
                {title.includes("Активность") ? "Шаги" : "Калории"}:{" "}
                <span style={{ color: themeColor }}>
                  {point.data.yFormatted}
                </span>{" "}
              </div>
            </div>
          )}
          enableArea={true}
          areaOpacity={0.08}
          theme={{
            axis: {
              ticks: {
                text: { fontSize: 10, fill: "#cbd5e1", fontWeight: 700 },
              },
            },
            grid: {
              line: { stroke: "#f1f5f9", strokeWidth: 1 },
            },
            crosshair: {
              line: {
                stroke: themeColor,
                strokeWidth: 1,
                strokeOpacity: 0.35,
              },
            },
          }}
        />
      </div>
    </div>
  );
}
