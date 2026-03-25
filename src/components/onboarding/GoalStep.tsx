"use client";

import { useOnboardingStore } from "@/store/useOnboardingStore";
import { Goal } from "@/types/onboarding";
import { Target, TrendingUp, Anchor, LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import { QuestionWrapper } from "./QuestionWrapper";
import { ChevronRight } from "lucide-react";

interface GoalOption {
  id: Goal;
  label: string;
  description: string;
  icon: LucideIcon;
  color: string;
}

const goals: GoalOption[] = [
  {
    id: "lose_weight",
    label: "Похудеть",
    description: "Сбросить лишний вес и сжечь жир",
    icon: Target,
    color: "text-rose-500 bg-rose-50 border-rose-100",
  },
  {
    id: "gain_muscle",
    label: "Набрать массу",
    description: "Увеличить мышечную массу и силу",
    icon: TrendingUp,
    color: "text-blue-500 bg-blue-50 border-blue-100",
  },
  {
    id: "maintain",
    label: "ЗОЖ",
    description: "Здоровое питание и работа с дефицитами",
    icon: Anchor,
    color: "text-emerald-500 bg-emerald-50 border-emerald-100",
  },
];

export default function GoalStep() {
  // Используем setGoal — он сразу сохраняет цель и переключает шаг
  const setGoal = useOnboardingStore((state) => state.setGoal);

  return (
    <QuestionWrapper
      title="Какова ваша цель?"
      description="Мы адаптируем план питания под выбранное направление"
    >
      <div className="grid gap-4 mt-4">
        {goals.map((goal) => (
          <motion.button
            key={goal.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setGoal(goal.id)}
            className="flex items-center p-5 border-2 border-gray-100 rounded-3xl text-left transition-all hover:border-blue-500 hover:shadow-xl focus:outline-none bg-white group"
          >
            <div
              className={`p-4 rounded-2xl mr-5 transition-transform group-hover:scale-110 ${goal.color}`}
            >
              <goal.icon size={28} />
            </div>
            <div className="flex flex-col pr-4">
              <span className="font-black text-xl text-gray-900 leading-none mb-1 uppercase tracking-tight">
                {goal.label}
              </span>
              <span className="text-sm font-medium text-gray-400 leading-tight">
                {goal.description}
              </span>
            </div>
            <div className="ml-auto text-gray-300 group-hover:text-blue-500 transition-colors">
              <ChevronRight size={20} />
            </div>
          </motion.button>
        ))}
      </div>
    </QuestionWrapper>
  );
}
