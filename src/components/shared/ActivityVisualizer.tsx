"use client";

import { useMemo } from "react";

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

  // Константы для построения графика
  const chartHeight = 160;

  const processedData = useMemo(() => {
    if (!data.length) return [];

    const maxValue = Math.max(...data.map((d) => d.y), 1); // Защита от 0

    return data.map((p) => ({
      date: p.x.split("-").reverse().slice(0, 2).join("."),
      value: p.y,
      // Рассчитываем высоту столбца относительно максимума
      height: (p.y / maxValue) * chartHeight,
    }));
  }, [data]);

  return (
    <div className="bg-[#080808] rounded-[2.5rem] p-6 border border-white/5 shadow-2xl h-[320px] flex flex-col group transition-all hover:border-white/10">
      {/* Header */}
      <div className="flex justify-between items-center mb-8 px-2">
        <div className="flex items-center gap-2">
          <div
            className="w-1.5 h-4 rounded-full"
            style={{ backgroundColor: themeColor }}
          />
          <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
            {title}
          </h3>
        </div>
        <span className="text-[10px] font-black text-slate-400 bg-white/5 px-3 py-1 rounded-full border border-white/5 uppercase italic">
          {unit}
        </span>
      </div>

      {/* SVG Chart Area */}
      <div className="flex-1 flex items-end justify-between gap-1 px-2 relative">
        {/* Горизонтальные линии сетки (BG) */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="w-full border-t border-white/10 h-0" />
          ))}
        </div>

        {processedData.map((item, index) => (
          <div
            key={index}
            className="flex flex-col items-center flex-1 group/bar relative"
          >
            {/* Тултип при наведении */}
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-[#111113] border border-white/10 px-3 py-2 rounded-xl opacity-0 group-hover/bar:opacity-100 transition-opacity pointer-events-none z-10 whitespace-nowrap shadow-2xl">
              <p className="text-[9px] font-black text-slate-500 uppercase">
                {item.date}
              </p>
              <p
                className="text-sm font-black italic"
                style={{ color: themeColor }}
              >
                {item.value.toLocaleString()}{" "}
                <span className="text-[10px] text-white/40">{unit}</span>
              </p>
            </div>

            {/* Столбец */}
            <div
              className="w-full max-w-[32px] rounded-t-xl transition-all duration-500 ease-out group-hover/bar:brightness-125"
              style={{
                height: `${item.height}px`,
                backgroundColor: themeColor,
                boxShadow: `0 0 20px ${themeColor}15`, // Мягкое свечение
              }}
            />

            {/* Подпись даты */}
            <span className="text-[10px] font-black text-slate-600 mt-4 uppercase tracking-tighter">
              {item.date}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
