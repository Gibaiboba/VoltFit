"use client";

import { useOnboardingStore, ActivityLevel } from "@/store/useOnboardingStore";
import { motion } from "framer-motion";
import { Coffee, Footprints, Dumbbell, Zap, LucideIcon } from "lucide-react";

// 1. Создаем интерфейс для опции активности
interface ActivityOption {
  value: ActivityLevel; // Здесь используем наш строгий тип из стора
  label: string;
  description: string;
  icon: LucideIcon; // Можно уточнить тип иконки, если нужно
}

// 2. Типизируем массив данных
const activities: ActivityOption[] = [
  {
    value: 1.2,
    label: "Минимальная",
    description: "Сидячая работа, почти нет физических нагрузок",
    icon: Coffee,
  },
  {
    value: 1.375,
    label: "Умеренная",
    description: "Тренировки или активные прогулки 1-3 раза в неделю",
    icon: Footprints,
  },
  {
    value: 1.55,
    label: "Активная",
    description: "Интенсивные занятия спортом 3-5 раз в неделю",
    icon: Dumbbell,
  },
  {
    value: 1.725,
    label: "Экстремальная",
    description: "Тяжелая физическая работа или ежедневные тренировки",
    icon: Zap,
  },
];

export default function ActivityStep() {
  const updateData = useOnboardingStore((state) => state.updateData);
  const nextStep = useOnboardingStore((state) => state.nextStep);
  // Достаем текущее значение, чтобы подсветить выбранную карточку
  const currentValue = useOnboardingStore((state) => state.data.activityLevel);

  const handleSelect = (value: ActivityLevel) => {
    updateData({ activityLevel: value });
    nextStep();
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex flex-col space-y-6 w-full max-w-md mx-auto"
    >
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold font-display">
          Твой уровень активности
        </h1>
        <p className="text-gray-500 text-sm italic">
          Это ключевой параметр для расчета нормы калорий
        </p>
      </div>

      <div className="grid gap-3">
        {activities.map((item) => (
          <button
            key={item.value}
            onClick={() => handleSelect(item.value)}
            className={`flex items-center p-4 border-2 rounded-2xl text-left transition-all duration-200 group ${
              currentValue === item.value
                ? "border-blue-600 bg-blue-50 shadow-sm"
                : "border-transparent bg-gray-50 hover:bg-gray-100"
            }`}
          >
            <div
              className={`p-3 rounded-xl mr-4 transition-colors ${
                currentValue === item.value
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-400 group-hover:text-blue-500"
              }`}
            >
              <item.icon size={24} />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-base leading-tight">
                {item.label}
              </span>
              <span className="text-xs text-gray-500 mt-1">
                {item.description}
              </span>
            </div>
          </button>
        ))}
      </div>
    </motion.div>
  );
}
