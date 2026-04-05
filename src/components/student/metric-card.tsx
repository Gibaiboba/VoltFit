// import { LucideIcon } from "lucide-react";

// interface MetricCardProps {
//   title: string;
//   icon: LucideIcon;
//   colorClass: {
//     bg: string;
//     border: string;
//     iconBg: string;
//     text: string;
//     footerText?: string;
//   };
//   children: React.ReactNode;
//   footer?: string;
// }

// export const MetricCard = ({
//   title,
//   icon: Icon,
//   colorClass,
//   children,
//   footer,
// }: MetricCardProps) => (
//   <div
//     className={`${colorClass.bg} p-5 rounded-[32px] border ${colorClass.border} flex flex-col items-center justify-between gap-3 min-h-[140px]`}
//   >
//     <div className="flex flex-col items-center gap-1">
//       <div
//         className={`p-2 ${colorClass.iconBg} rounded-xl text-white shadow-lg`}
//       >
//         <Icon size={20} />
//       </div>
//       <span
//         className={`text-[10px] font-black uppercase ${colorClass.text} tracking-widest mt-1`}
//       >
//         {title}
//       </span>
//     </div>
//     {children}
//     {footer && (
//       <div
//         className={`text-[8px] font-bold ${colorClass.footerText || "opacity-40"} uppercase`}
//       >
//         {footer}
//       </div>
//     )}
//   </div>
// );
// components/student/MetricCard.tsx
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
