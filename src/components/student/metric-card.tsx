import React from "react";
import { LucideIcon } from "lucide-react";

// Экспортируем интерфейс, чтобы его можно было использовать в других местах
export interface MetricCardProps {
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
    className={`p-5 rounded-[32px] border ${colorClass.border} ${colorClass.bg} flex flex-col items-center justify-center space-y-3 relative overflow-hidden transition-all hover:shadow-md`}
  >
    <div className={`p-2 rounded-xl ${colorClass.iconBg} text-white`}>
      <Icon size={18} />
    </div>
    <div className="text-center">
      <div
        className={`text-[10px] font-black uppercase tracking-wider ${colorClass.text} mb-1`}
      >
        {title}
      </div>
      {children}
    </div>
    {footer && (
      <div
        className={`text-[9px] font-bold ${colorClass.footerText} uppercase mt-1`}
      >
        {footer}
      </div>
    )}
  </div>
);
