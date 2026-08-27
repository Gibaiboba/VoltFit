"use client";

import Link from "next/link";
import { LucideIcon, Plus } from "lucide-react";

interface TabItem {
  id: string;
  label: string;
  icon: LucideIcon;
}

interface StudentBottomBarProps {
  pathname: string;
  leftTabs: TabItem[];
  rightTabs: TabItem[];
  isMenuOpen: boolean;
  setIsMenuOpen: (open: boolean) => void;
}

export function StudentBottomBar({
  pathname,
  leftTabs,
  rightTabs,
  isMenuOpen,
  setIsMenuOpen,
}: StudentBottomBarProps) {
  const renderTab = (tab: TabItem) => {
    const Icon = tab.icon;
    const isActive = pathname === tab.id;

    return (
      <Link
        key={tab.id}
        href={tab.id}
        prefetch={true}
        className="flex flex-col items-center justify-center flex-1 h-full gap-0.5 md:gap-1 transition-all group"
      >
        <Icon
          className={`w-4.5 h-4.5 md:w-5 md:h-5 transition-all duration-200 ${
            isActive
              ? "text-[#23C55E]"
              : "text-slate-400 group-hover:text-slate-600"
          }`}
          strokeWidth={isActive ? 2.4 : 1.8}
        />
        <span
          className={`text-[9px] md:text-[10px] font-bold tracking-wide transition-colors duration-200 ${
            isActive
              ? "text-[#23C55E]"
              : "text-slate-400 group-hover:text-slate-600"
          }`}
        >
          {tab.label}
        </span>
      </Link>
    );
  };

  return (
    <div className="w-full max-w-sm mx-auto md:max-w-4xl bg-white/[0.35] backdrop-blur-3xl border border-white rounded-[32px] shadow-[0_32px_50px_-12px_rgba(0,0,0,0.1),0_16px_24px_-8px_rgba(0,0,0,0.05)] transition-all duration-300">
      <div className="flex items-center justify-between h-14 md:h-16 px-4">
        <div className="flex items-center justify-around flex-1 h-full">
          {leftTabs.map(renderTab)}
        </div>

        {/* Центральная кнопка Плюс */}
        <div className="relative -top-3 px-2 shrink-0">
          <button
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 cursor-pointer ${
              isMenuOpen
                ? "bg-slate-800 text-white rotate-45 scale-90"
                : "bg-[#23C55E] text-white hover:bg-[#1fae52] hover:scale-105 shadow-[#23C55E]/20"
            }`}
          >
            <Plus className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </div>

        <div className="flex items-center justify-around flex-1 h-full">
          {rightTabs.map(renderTab)}
        </div>
      </div>
    </div>
  );
}
