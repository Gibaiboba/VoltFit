"use client";

import { useOnboardingStore } from "@/store/useOnboardingStore";
import { ChevronLeft, LogOut } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { QUESTIONS } from "@/constants/questions";
import { motion, AnimatePresence } from "framer-motion";

// Только цвета текста для логотипа
const THEMES = {
  lose_weight: "text-rose-500",
  gain_muscle: "text-blue-600",
  maintain: "text-emerald-500",
  default: "text-blue-600",
};

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { step, prevStep, data, reset } = useOnboardingStore();
  const router = useRouter();

  const handleLogout = async () => {
    reset();
    await supabase.auth.signOut();
    router.push("/login");
  };

  const currentBranch = QUESTIONS[data.goal as keyof typeof QUESTIONS] || [];
  const totalStepsInApp = currentBranch.length + 3;

  const activeTheme =
    THEMES[data.goal as keyof typeof THEMES] || THEMES.default;

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans selection:bg-blue-100">
      <header className="px-6 flex justify-between items-center max-w-md mx-auto w-full h-24 flex-shrink-0">
        <div className="w-10">
          <AnimatePresence mode="wait">
            {step > 1 && step <= totalStepsInApp && (
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
            onClick={handleLogout}
            className="p-2 text-gray-300 hover:text-red-500 transition-all hover:rotate-12"
            title="Выход"
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>

      {/* 
        MAIN CONTENT: 
        Начинается СРАЗУ после хедера и занимает все оставшееся место.
      */}
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
      {data.goal && step > 1 && (
        <footer className="p-6 text-center mt-auto flex-shrink-0">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-300">
            Цель: {data.goal.replace("_", " ")}
          </span>
        </footer>
      )}
    </div>
  );
}
