"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useOnboardingStore } from "@/store/useOnboardingStore";
import { ReactNode } from "react";

interface QuestionWrapperProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export const QuestionWrapper = ({
  title,
  description,
  children,
}: QuestionWrapperProps) => {
  // Достаем текущий инсайт из твоего стора
  const currentInsight = useOnboardingStore((state) => state.currentInsight);

  return (
    <div className="flex flex-col h-full w-full max-w-md mx-auto">
      {/* Секция заголовка */}
      <div className="mb-8">
        <h2 className="text-3xl font-black text-gray-900 leading-tight tracking-tight uppercase">
          {title}
        </h2>
        {description && (
          <p className="mt-3 text-gray-500 font-medium leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {/* Контент вопроса (кнопки или инпуты) */}
      <div className="flex-1">{children}</div>

      {/* Всплывающая плашка с инсайтом (💡) */}
      <AnimatePresence>
        {currentInsight && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-10 left-6 right-6 z-50"
          >
            <div className="bg-blue-600 text-white p-5 rounded-3xl shadow-2xl border-t-4 border-blue-400 flex items-start gap-4">
              <div className="bg-white/20 p-2 rounded-full">
                <span className="text-xl">💡</span>
              </div>
              <p className="text-sm font-bold leading-snug pt-1">
                {currentInsight}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
