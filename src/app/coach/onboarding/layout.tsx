"use client";

import { useState } from "react";
import { useCoachOnboardingStore } from "@/store/useCoachOnboardingStore";
import { ChevronLeft, LogOut } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { COACH_QUESTIONS } from "@/constants/coachQuestions";
import { motion, AnimatePresence } from "framer-motion";
import { ExitConfirmModal } from "@/components/ui/ExitConfirmModal";

export default function CoachOnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { step, prevStep, reset } = useCoachOnboardingStore();
  const router = useRouter();
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);

  const handleLogoutClick = () => {
    setIsExitModalOpen(true);
  };

  const handleConfirmLogout = async () => {
    setIsExitModalOpen(false);
    await supabase.auth.signOut();
    router.replace("/login");
    reset(); // Очищает "coach-onboarding-storage"
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-blue-100">
      <header className="px-6 flex justify-between items-center max-w-md mx-auto w-full h-24 flex-shrink-0">
        <div className="w-10">
          <AnimatePresence mode="wait">
            {step > 1 && step <= COACH_QUESTIONS.length && (
              <motion.button
                key="coach-back-btn"
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -5 }}
                onClick={prevStep}
                className="p-2 -ml-2 text-slate-400 hover:text-black transition-colors rounded-full hover:bg-slate-100"
              >
                <ChevronLeft size={28} />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        <div className="font-black text-2xl tracking-tighter uppercase italic text-slate-900">
          VoltFit{" "}
          <span className="text-xs not-italic font-medium text-blue-600 tracking-normal ml-0.5 border border-blue-200 px-1.5 py-0.5 rounded-md bg-blue-50">
            COACH
          </span>
        </div>

        <div className="w-10 flex justify-end">
          <button
            onClick={handleLogoutClick}
            className="p-2 text-slate-300 hover:text-red-500 transition-all hover:rotate-12"
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

      {/* Модальное окно подтверждения выхода */}
      <ExitConfirmModal
        isOpen={isExitModalOpen}
        onClose={() => setIsExitModalOpen(false)}
        onConfirm={handleConfirmLogout}
        description="Прогресс анкетирования и настройки профиля тренера не сохранятся."
      />
    </div>
  );
}
