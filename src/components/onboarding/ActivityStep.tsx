"use client";

import { useOnboardingStore } from "@/store/useOnboardingStore";
import { ActivityLevel } from "@/types/onboarding"; // Импортируем из общего файла типов
import { motion } from "framer-motion";
import {
  Coffee,
  Footprints,
  Dumbbell,
  Zap,
  LucideIcon,
  CheckCircle2,
} from "lucide-react";
import { QuestionWrapper } from "./QuestionWrapper";

interface ActivityOption {
  value: ActivityLevel;
  label: string;
  description: string;
  icon: LucideIcon;
}

const activities: ActivityOption[] = [
  {
    value: 1.2,
    label: "Минимальная",
    description: "Сидячая работа, почти нет нагрузок",
    icon: Coffee,
  },
  {
    value: 1.375,
    label: "Умеренная",
    description: "Прогулки или спорт 1-3 раза в неделю",
    icon: Footprints,
  },
  {
    value: 1.55,
    label: "Активная",
    description: "Интенсивный спорт 3-5 раз в неделю",
    icon: Dumbbell,
  },
  {
    value: 1.725,
    label: "Экстремальная",
    description: "Физический труд или ежедневный спорт",
    icon: Zap,
  },
];

export default function ActivityStep() {
  // Используем специализированный метод из стора
  const setActivity = useOnboardingStore((state) => state.setActivity);
  const currentValue = useOnboardingStore((state) => state.data.activityLevel);

  return (
    <QuestionWrapper
      title="Твой уровень активности"
      description="Это ключевой параметр для точного расчета нормы калорий"
    >
      <div className="grid gap-3 mt-4">
        {activities.map((item) => (
          <motion.button
            key={item.value}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActivity(item.value)}
            className={`flex items-center p-5 border-2 rounded-3xl text-left transition-all duration-300 group relative ${
              currentValue === item.value
                ? "border-blue-600 bg-blue-50 shadow-md shadow-blue-100"
                : "border-gray-100 bg-white hover:border-blue-200 hover:bg-gray-50"
            }`}
          >
            {/* Иконка слева */}
            <div
              className={`p-3 rounded-2xl mr-5 transition-all ${
                currentValue === item.value
                  ? "bg-blue-600 text-white rotate-6"
                  : "bg-gray-100 text-gray-400 group-hover:text-blue-500"
              }`}
            >
              <item.icon size={28} />
            </div>

            {/* Текст */}
            <div className="flex flex-col pr-8">
              <span
                className={`font-black text-lg uppercase tracking-tight leading-none mb-1 ${
                  currentValue === item.value
                    ? "text-blue-900"
                    : "text-gray-700"
                }`}
              >
                {item.label}
              </span>
              <span className="text-xs font-medium text-gray-400 leading-tight">
                {item.description}
              </span>
            </div>

            {/* Галочка выбора */}
            {currentValue === item.value && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="ml-auto text-blue-600"
              >
                <CheckCircle2
                  size={24}
                  fill="currentColor"
                  className="text-white fill-blue-600"
                />
              </motion.div>
            )}
          </motion.button>
        ))}
      </div>
    </QuestionWrapper>
  );
}
