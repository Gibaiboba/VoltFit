"use client";

import { useMemo } from "react";
import { formatToShortDate } from "@/lib/utils/date-utils";
import { formatNumber } from "@/lib/utils/format-number";

export interface ChartPoint {
  x: string;
  y: number;
}

interface Props {
  title: string;
  unit: string;
  data: ChartPoint[];
  color: "yellow" | "cyan";
}

export default function ActivityVisualizer({
  title,
  unit,
  data,
  color,
}: Props) {
  const themeColor = color === "yellow" ? "#facc15" : "#22d3ee";
  const chartHeight = 160;

  const processedData = useMemo(() => {
    if (!data.length) return [];

    const maxValue = Math.max(...data.map((d) => d.y), 1);

    return data.map((p) => ({
      date: formatToShortDate(p.x),
      value: p.y,
      height: (p.y / maxValue) * chartHeight,
    }));
  }, [data]);

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 border-2 border-slate-200 h-[320px] flex flex-col relative text-slate-900">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 px-1">
        <div className="flex items-center gap-2">
          <div
            className="w-2 h-4 border border-slate-900/10"
            style={{ backgroundColor: themeColor }}
          />
          <h3 className="text-xs font-black uppercase italic tracking-tight text-slate-900">
            {title}
          </h3>
        </div>
        <span className="text-[10px] font-black text-slate-700 bg-slate-100 px-3 py-1 rounded-md border-2 border-slate-200 uppercase italic tracking-wider">
          {unit}
        </span>
      </div>

      {/* gap-1 на мобилках, gap-2 на планшетах/десктопах */}
      <div className="flex-1 flex items-end justify-between gap-1 sm:gap-2 px-1 relative">
        {/* Линии сетки графика */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-40">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="w-full border-t-2 border-dashed border-slate-200 h-0"
            />
          ))}
        </div>

        {processedData.map((item, index) => (
          <div
            key={index}
            className="flex flex-col items-center flex-1 group/bar relative"
          >
            {/* Тултип */}
            <div className="absolute -top-14 left-1/2 -translate-x-1/2 bg-white border-2 border-slate-900 px-3 py-1.5 rounded-xl opacity-0 group-hover/bar:opacity-100 transition-opacity pointer-events-none z-10 whitespace-nowrap shadow-[4px_4px_0px_0px_rgba(15,23,42,0.1)]">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">
                {item.date}
              </p>
              <p
                className="text-sm font-black italic"
                style={{ color: themeColor }}
              >
                {formatNumber(item.value)}{" "}
                <span className="text-[10px] text-slate-500 font-bold lowercase">
                  {unit}
                </span>
              </p>
            </div>

            <div
              className="w-full max-w-[14px] sm:max-w-[28px] rounded-t-sm sm:rounded-t-md border-t border-x border-slate-900/10 transition-all duration-200 group-hover/bar:brightness-95"
              style={{
                height: `${item.height}px`,
                backgroundColor: themeColor,
              }}
            />

            <span className="text-[8px] sm:text-[10px] font-black text-slate-500 mt-2 sm:mt-3 uppercase tracking-tighter sm:tracking-tight italic">
              {item.date}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
