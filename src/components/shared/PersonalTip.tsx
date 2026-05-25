"use client";
import { OnboardingMetadata } from "@/types/user";
import { getTipContent } from "@/constants/tipContent";
import { motion } from "framer-motion";
import { Zap } from "lucide-react";

interface PersonalTipProps {
  metadata?: OnboardingMetadata | undefined | null;
}

export default function PersonalTip({ metadata }: PersonalTipProps) {
  if (!metadata) return null;

  const tip = getTipContent(metadata);
  // Используем фирменный цвет
  const accentColor = "#2010d4";

  return (
    <motion.div
      initial={{ y: 20, opacity: 0, scale: 0.95 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="relative"
    >
      {/* Светлая карточка, рамка slate-100 и мягкая тень shadow-sm */}
      <div className="relative flex items-center gap-4 p-5 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm overflow-hidden group">
        {/* Иконка: плашка с полупрозрачным фоном в стиле макронутриентов */}
        <div className="relative shrink-0 ml-1">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center border border-slate-50 transition-transform group-hover:scale-105"
            style={{
              backgroundColor: `${accentColor}12`,
              boxShadow: `0 2px 6px rgba(99, 102, 241, 0.12)`,
            }}
          >
            <tip.icon
              className="w-5 h-5"
              style={{ color: accentColor }}
              strokeWidth={2.2}
            />
          </div>
        </div>

        {/* Текст совета */}
        <div className="flex flex-col gap-0.5">
          {/* Плашка Volt Intelligence */}
          <div className="flex items-center gap-1.5">
            <Zap
              size={11}
              style={{ color: accentColor }}
              className="fill-current"
            />
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Volt Intelligence
            </span>
          </div>
          <p className="text-slate-600 font-medium text-sm leading-relaxed pr-2">
            {tip.text}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
