"use client";

import { useOnboardingStore, Goal } from "@/store/useOnboardingStore";
import { Target, TrendingUp, Anchor, LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

// Описываем тип для элемента списка целей
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
    color: "text-blue-500 bg-blue-50",
  },
  {
    id: "gain_muscle",
    label: "Набрать массу",
    description: "Увеличить мышечную массу и силу",
    icon: TrendingUp,
    color: "text-orange-500 bg-orange-50",
  },
  {
    id: "maintain",
    label: "Поддерживать форму",
    description: "Сохранить текущий вес и тонус",
    icon: Anchor,
    color: "text-green-500 bg-green-50",
  },
];

export default function GoalStep() {
  // Вытаскиваем нужные методы из стора с типизацией
  const updateData = useOnboardingStore((state) => state.updateData);
  const nextStep = useOnboardingStore((state) => state.nextStep);

  const handleSelect = (goalId: Goal) => {
    updateData({ goal: goalId });
    nextStep();
  };

  return (
    <div className="flex flex-col space-y-8 w-full max-w-md mx-auto">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Какова ваша цель?</h1>
        <p className="text-gray-500 text-sm">
          Мы адаптируем план питания под выбранное направление
        </p>
      </div>

      <div className="grid gap-4">
        {goals.map((goal) => (
          <motion.button
            key={goal.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleSelect(goal.id)}
            className="flex items-start p-5 border-2 rounded-2xl text-left transition-all hover:border-blue-500 hover:shadow-md focus:outline-none focus:ring-2 ring-blue-200"
          >
            <div className={`p-3 rounded-xl mr-4 ${goal.color}`}>
              <goal.icon size={24} />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg">{goal.label}</span>
              <span className="text-sm text-gray-500">{goal.description}</span>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
