interface MacroCardProps {
  label: string;
  current: number;
  target: number;
  colors: { color: string; light: string; text: string };
}

export const MacroCard = ({
  label,
  current,
  target,
  colors,
}: MacroCardProps) => {
  const progress = target > 0 ? (current / target) * 100 : 0;
  return (
    <div
      className={`${colors.light} p-4 rounded-[32px] border border-white shadow-sm flex flex-col items-center relative overflow-hidden`}
    >
      <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-1">
        {label}
      </span>
      <div
        className={`text-2xl font-black italic ${colors.text} leading-none mb-1`}
      >
        {current}
        <span className="text-[10px] not-italic ml-0.5 opacity-60">г</span>
      </div>
      <div className="text-[8px] font-bold text-slate-400 uppercase">
        из {target}г план
      </div>
      <div className="w-full h-1 bg-white rounded-full mt-3 overflow-hidden">
        <div
          className={`h-full ${colors.color} transition-all duration-1000`}
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
    </div>
  );
};
