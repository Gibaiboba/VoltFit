"use client";

import { useState } from "react";
import { OnboardingMetadata } from "@/types/user";
import { getTipContent } from "@/constants/tipContent";
import { motion } from "framer-motion";

interface PersonalTipProps {
  metadata?: OnboardingMetadata | undefined | null;
}

// Список градиентов
const GRADIENTS = [
  "from-indigo-600 to-purple-600",
  "from-violet-600 to-indigo-700",
  "from-blue-600 to-violet-600",
  "from-slate-900 to-slate-800",
  "from-purple-700 to-fuchsia-600",
];

export default function PersonalTip({ metadata }: PersonalTipProps) {
  // Выбираем случайный градиент из массива ровно один раз при инициализации
  const [bgGradient] = useState<string>(() => {
    const randomIndex = Math.floor(Math.random() * GRADIENTS.length);
    return GRADIENTS[randomIndex];
  });

  if (!metadata) return null;

  const tip = getTipContent(metadata);

  return (
    <motion.div
      initial={{ y: 20, opacity: 0, scale: 0.95 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="relative"
    >
      <div
        className={`relative flex items-center mt-6 mb-6 gap-4 px-5 py-7 bg-gradient-to-r ${bgGradient} border border-white/10 rounded-3xl shadow-xl overflow-hidden group`}
      >
        {/* Иконка: белая полупрозрачная плашка для контраста */}
        <div className="relative shrink-0 ml-1 z-10">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-white/15 backdrop-blur-md border border-white/20 transition-transform group-hover:scale-105 shadow-sm">
            <tip.icon className="w-5 h-5 text-white" strokeWidth={2.2} />
          </div>
        </div>

        <div className="flex flex-col gap-1 z-10 flex-1">
          {/* Сам текст белый и чистый */}
          <p className="text-white font-bold text-sm leading-relaxed pr-2">
            {tip.text}
          </p>
        </div>

        {/* Легкий декоративный элемент: внутреннее свечение для объема */}
        <div className="absolute -right-10 -top-10 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
      </div>
    </motion.div>
  );
}
