import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  icon: LucideIcon;
  colorClass: {
    bg: string;
    border: string;
    iconBg: string;
    text: string;
    footerText?: string;
  };
  children: React.ReactNode;
  footer?: string;
}

export const MetricCard = ({
  title,
  icon: Icon,
  colorClass,
  children,
  footer,
}: MetricCardProps) => (
  <div
    className={`${colorClass.bg} p-5 rounded-[32px] border ${colorClass.border} flex flex-col items-center justify-between gap-3 min-h-[140px]`}
  >
    <div className="flex flex-col items-center gap-1">
      <div
        className={`p-2 ${colorClass.iconBg} rounded-xl text-white shadow-lg`}
      >
        <Icon size={20} />
      </div>
      <span
        className={`text-[10px] font-black uppercase ${colorClass.text} tracking-widest mt-1`}
      >
        {title}
      </span>
    </div>
    {children}
    {footer && (
      <div
        className={`text-[8px] font-bold ${colorClass.footerText || "opacity-40"} uppercase`}
      >
        {footer}
      </div>
    )}
  </div>
);
