"use client";

import { useState } from "react";
import { useOnboardingStore } from "@/store/useOnboardingStore";
import { ChevronLeft, LogOut } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { BASE_QUESTIONS, TARGET_QUESTIONS } from "@/constants/questions";
import { motion, AnimatePresence } from "framer-motion";
import { ExitConfirmModal } from "@/components/ui/ExitConfirmModal";

const THEMES = {
  lose_weight: "text-rose-500",
  gain_muscle: "text-blue-600",
  maintain: "text-emerald-500",
  default: "text-blue-600",
};

const GOAL_LABELS: Record<string, string> = {
  lose_weight: "Похудение",
  gain_muscle: "Набор массы",
  maintain: "ЗОЖ и тонус",
};

/**
 * Хелпер пайплайна (точно такой же, как на главной странице опроса)
 */
function getOnboardingPipeline(goal?: string) {
  const pipeline = [...BASE_QUESTIONS.map((q) => q.id), "goal"];
  if (goal && TARGET_QUESTIONS[goal]) {
    pipeline.push(...TARGET_QUESTIONS[goal].map((q) => q.id));
  }
  pipeline.push("activity");
  pipeline.push("processing");
  return pipeline;
}

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { step, prevStep, data, reset } = useOnboardingStore();
  const router = useRouter();
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);

  const handleLogoutClick = () => {
    setIsExitModalOpen(true);
  };

  const handleConfirmLogout = async () => {
    setIsExitModalOpen(false);
    await supabase.auth.signOut();
    router.replace("/login");
    reset();
  };

  // Динамически получаем пайплайн для точного расчета видимости кнопки «Назад»
  const pipeline = getOnboardingPipeline(data.goal);
  const totalSteps = pipeline.length;

  // Кнопка «Назад» показывается со 2-го шага и ИСЧЕЗАЕТ на последнем экране
  const shouldShowBackButton = step > 1 && step < totalSteps;

  const activeTheme =
    THEMES[data.goal as keyof typeof THEMES] || THEMES.default;

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans selection:bg-blue-100">
      <header className="px-6 flex justify-between items-center max-w-md mx-auto w-full h-24 flex-shrink-0">
        <div className="w-10">
          <AnimatePresence mode="wait">
            {shouldShowBackButton && (
              <motion.button
                key="back-btn"
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -5 }}
                onClick={prevStep}
                className="p-2 -ml-2 text-gray-400 hover:text-black transition-colors rounded-full hover:bg-gray-50"
              >
                <ChevronLeft size={28} />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        <div
          className={`font-black text-2xl tracking-tighter uppercase italic transition-colors duration-500 ${activeTheme}`}
        >
          VoltFit
        </div>

        <div className="w-10 flex justify-end">
          <button
            onClick={handleLogoutClick}
            className="p-2 text-gray-300 hover:text-red-500 transition-all hover:rotate-12"
            title="Выход"
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col w-full max-w-md mx-auto px-6 pb-10">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex-1 flex flex-col"
        >
          {children}
        </motion.div>
      </main>

      {/* FOOTER */}
      {data.goal && shouldShowBackButton && (
        <footer className="p-6 text-center mt-auto flex-shrink-0 animate-fadeIn">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-300">
            Цель: {GOAL_LABELS[data.goal] || "Анализ параметров"}
          </span>
        </footer>
      )}

      {/* Модальное окно подтверждения выхода */}
      <ExitConfirmModal
        isOpen={isExitModalOpen}
        onClose={() => setIsExitModalOpen(false)}
        onConfirm={handleConfirmLogout}
        description="Все заполненные данные анкетирования атлета будут полностью удалены."
      />
    </div>
  );
}
