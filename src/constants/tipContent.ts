import { Lightbulb, Target, Utensils, Footprints } from "lucide-react";
import { OnboardingMetadata } from "@/types/user";

export const getTipContent = (metadata: OnboardingMetadata) => {
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
