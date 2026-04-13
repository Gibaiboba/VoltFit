"use client";
import { OnboardingMetadata } from "@/types/user";
import { Lightbulb, Target, Utensils, Footprints } from "lucide-react";
import { motion } from "framer-motion";

interface PersonalTipProps {
  metadata?: OnboardingMetadata;
}

export default function PersonalTip({ metadata }: PersonalTipProps) {
  if (!metadata) return null;

  const getTipContent = () => {
    if (metadata.main_enemy === "sweets") {
      return {
        text: "Тяга к сладкому? Попробуй добавить хром или съесть фрукт прямо сейчас.",
        icon: Utensils,
        color: "bg-amber-500",
      };
    }
    if (metadata.main_enemy === "night_eating") {
      return {
        text: "Помни: плотный белковый ужин поможет избежать ночных перекусов.",
        icon: Target,
        color: "bg-indigo-600",
      };
    }
    if (metadata.training_mode === "none") {
      return {
        text: "Не любишь спорт? Просто постарайся сегодня закрыть цель по шагам!",
        icon: Footprints,
        color: "bg-emerald-600",
      };
    }
    return {
      text: "План составлен! Просто придерживайся цифр и результат придет.",
      icon: Lightbulb,
      color: "bg-blue-600",
    };
  };

  const tip = getTipContent();

  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={`${tip.color} text-white p-5 rounded-[32px] shadow-lg shadow-blue-100 flex items-center gap-4`}
    >
      <div className="bg-white/20 p-3 rounded-2xl shrink-0">
        <tip.icon size={24} />
      </div>
      <p className="font-bold text-sm leading-tight italic">{tip.text}</p>
    </motion.div>
  );
}
