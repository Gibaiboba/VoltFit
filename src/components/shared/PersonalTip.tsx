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

  return (
    <motion.div
      initial={{ y: 20, opacity: 0, scale: 0.95 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="relative overflow-hidden"
    >
      {/* Эффект свечения за карточкой в стиле Linear */}
      <div className="absolute -inset-1 bg-yellow-400/10 blur-2xl rounded-[2.5rem]" />

      <div className="relative flex items-center gap-5 p-6 bg-[#080808] border border-white/5 rounded-[2.5rem] shadow-2xl overflow-hidden group">
        {/* Анимированная полоска "заряда" слева */}
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.5)]" />

        {/* Иконка в Volt-стиле */}
        <div className="relative shrink-0">
          <div className="absolute inset-0 bg-yellow-400 blur-lg opacity-20 group-hover:opacity-40 transition-opacity" />
          <div className="relative bg-yellow-400 p-3.5 rounded-2xl flex items-center justify-center transform group-hover:rotate-6 transition-transform">
            <tip.icon className="text-black w-6 h-6" strokeWidth={2.5} />
          </div>
        </div>

        {/* Текст совета */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Zap size={10} className="text-yellow-400 fill-yellow-400" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-yellow-400/60">
              Volt Intelligence
            </span>
          </div>
          <p className="text-slate-300 font-bold text-sm leading-relaxed italic pr-4">
            {tip.text}
          </p>
        </div>

        {/* Декоративный элемент "сетки" на фоне */}
        <div className="absolute right-0 top-0 opacity-[0.03] pointer-events-none translate-x-1/4 -translate-y-1/4">
          <div className="w-32 h-32 border-[10px] border-white rounded-full" />
        </div>
      </div>
    </motion.div>
  );
}
