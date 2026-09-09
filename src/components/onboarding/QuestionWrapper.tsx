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
  const currentInsight = useOnboardingStore((state) => state.currentInsight);

  return (
    <div className="flex flex-col w-full max-w-md mx-auto min-h-[450px] justify-between">
      <div className="mb-6 shrink-0 min-h-[90px] flex flex-col justify-end">
        <h2 className="text-3xl font-black text-gray-900 leading-tight tracking-tight uppercase line-clamp-2">
          {title}
        </h2>
        {description ? (
          <p className="mt-2 text-gray-500 font-medium leading-relaxed text-sm">
            {description}
          </p>
        ) : (
          <div className="h-4" />
        )}
      </div>

      <div className="flex-1 flex flex-col justify-start">{children}</div>

      <div className="h-16 shrink-0 relative mt-4">
        <AnimatePresence>
          {currentInsight && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute inset-x-0 bottom-0 z-40"
            >
              <div className="bg-blue-600 text-white p-4 rounded-3xl shadow-xl border-t-4 border-blue-400 flex items-start gap-3">
                <div className="bg-white/20 p-1.5 rounded-full shrink-0">
                  <span className="text-base">💡</span>
                </div>
                <p className="text-xs font-bold leading-snug pt-0.5">
                  {currentInsight}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
