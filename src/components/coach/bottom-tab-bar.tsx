"use client";

import Link from "next/link";
import { LucideIcon, Plus } from "lucide-react";

interface TabItem {
  id: string;
  label: string;
  icon: LucideIcon;
}

interface BottomTabBarProps {
  pathname: string;
  leftTabs: TabItem[];
  rightTabs: TabItem[];
  isMenuOpen: boolean;
  setIsMenuOpen: (open: boolean) => void;
}

export function BottomTabBar({
  pathname,
  leftTabs,
  rightTabs,
  isMenuOpen,
  setIsMenuOpen,
}: BottomTabBarProps) {
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
              ? "text-blue-600"
              : "text-slate-400 group-hover:text-slate-600"
          }`}
          strokeWidth={isActive ? 2.4 : 1.8}
        />
        <span
          className={`text-[9px] md:text-[10px] font-bold tracking-wide transition-colors duration-200 ${
            isActive
              ? "text-blue-600"
              : "text-slate-400 group-hover:text-slate-600"
          }`}
        >
          {tab.label}
        </span>
      </Link>
    );
  };

  return (
    <div className="w-full max-w-sm mx-auto bg-white/[0.35] backdrop-blur-3xl border border-white rounded-[32px] shadow-lg">
      <div className="flex items-center justify-between h-14 px-4">
        <div className="flex items-center justify-around flex-1 h-full">
          {leftTabs.map(renderTab)}
        </div>

        {/* ЦЕНТРАЛЬНАЯ КНОПКА ПЛЮС */}
        <div className="relative -top-3 px-2 shrink-0">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 cursor-pointer ${
              isMenuOpen
                ? "bg-slate-800 text-white rotate-45 scale-90"
                : "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-600/20"
            }`}
          >
            <Plus className="w-6 h-6" strokeWidth={2.5} />
          </button>
        </div>

        <div className="flex items-center justify-around flex-1 h-full">
          {rightTabs.map(renderTab)}
          <div className="flex-1 h-full" />
        </div>
      </div>
    </div>
  );
}
