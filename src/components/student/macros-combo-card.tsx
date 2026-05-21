interface MacroItem {
  label: string;
  current: number;
  target: number;
  colors: {
    stroke: string;
    bg?: string;
    accent?: string;
  };
}

interface MacrosComboCardProps {
  macros: MacroItem[];
}

export const MacrosComboCard = ({ macros }: MacrosComboCardProps) => {
  const radius = 38; // Чуть уменьшили радиус, чтобы три круга идеально встали в ряд
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm w-full transition-all">
      {/* Сетка для трех нутриентов: на мобильных в столбик, от sm — в один ряд */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
        {macros.map((m, idx) => {
          const progress = m.target > 0 ? (m.current / m.target) * 100 : 0;
          const offset =
            circumference - (circumference * Math.min(progress, 100)) / 100;

          return (
            <div
              key={m.label}
              className={`flex flex-col items-center justify-center ${
                idx > 0 ? "pt-4 sm:pt-0 sm:pl-4" : ""
              }`}
            >
              {/* Название нутриента */}
              <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider mb-2">
                {m.label}
              </span>

              {/* SVG Круг */}
              <div className="relative w-28 h-28 flex items-center justify-center">
                <svg
                  viewBox="0 0 100 100"
                  className="w-full h-full -rotate-90 overflow-visible"
                >
                  <defs>
                    <filter id={`glow-${m.label}`}>
                      <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                      <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>

                  {/* Серый трек */}
                  <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    fill="none"
                    stroke="#f1f5f9"
                    strokeWidth="8"
                  />

                  {/* Активный цветной прогресс */}
                  <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    fill="none"
                    stroke={m.colors.stroke}
                    strokeWidth="8"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    filter={`url(#glow-${m.label})`}
                    className="transition-all duration-[1500ms] ease-in-out"
                  />
                </svg>

                {/* Текст внутри круга */}
                <div className="absolute flex flex-col items-center leading-none">
                  <span
                    className="text-2xl font-black italic tracking-tighter"
                    style={{
                      color: m.colors.stroke,
                      textShadow: `0 2px 6px ${m.colors.stroke}30`,
                    }}
                  >
                    {Math.round(m.current)}
                  </span>
                  <span className="text-[9px] font-medium text-slate-400 mt-0.5">
                    из {m.target}г
                  </span>
                </div>
              </div>

              {/* Процент выполнения */}
              <span
                className="text-[10px] font-black mt-2 px-2.5 py-0.5 rounded-full"
                style={{
                  color: m.colors.stroke,
                  backgroundColor: `${m.colors.stroke}12`,
                }}
              >
                {Math.round(progress)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
