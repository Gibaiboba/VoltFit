export function MacroBox({
  label,
  value,
  color,
  bg,
}: {
  label: string;
  value?: number;
  color: string;
  bg: string;
}) {
  return (
    <div
      className={`flex-1 ${bg} px-4 py-2 rounded-2xl border border-slate-100/50`}
    >
      <p
        className={`text-[8px] font-black uppercase tracking-widest ${color} mb-0.5`}
      >
        {label}
      </p>
      <p className="text-sm font-black text-slate-700">
        {value ? `${Math.round(value)}г` : "--"}
      </p>
    </div>
  );
}
