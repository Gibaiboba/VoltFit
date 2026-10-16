"use client";

import { motion } from "framer-motion";
import { FITNESS_QUESTIONS } from "@/constants/workout/fitnessQuestion";

interface WorkoutOnboardingProps {
  currentQuestionIndex: number;
  handleSelectOnboardingOption: (questionId: string, value: string) => void;
}

export default function WorkoutOnboarding({
  currentQuestionIndex,
  handleSelectOnboardingOption,
}: WorkoutOnboardingProps) {
  const currentQuestion = FITNESS_QUESTIONS[currentQuestionIndex];

  return (
    <motion.div
      key="fit-onboarding"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      className="max-w-md mx-auto bg-white p-8 rounded-[36px] shadow-sm border border-slate-100 flex flex-col min-h-[420px] justify-between text-left"
    >
      <div>
        <span className="text-[10px] font-black uppercase text-blue-600 tracking-widest">
          Спортивный профиль • Шаг {currentQuestionIndex + 1} из{" "}
          {FITNESS_QUESTIONS.length}
        </span>
        <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight mt-2 leading-tight">
          {currentQuestion.title}
        </h2>
      </div>

      <div className="space-y-3 my-6">
        {currentQuestion.options.map((opt) => (
          <button
            key={opt.value}
            onClick={() =>
              handleSelectOnboardingOption(currentQuestion.id, opt.value)
            }
            className="w-full p-5 text-left border-2 border-slate-100 rounded-2xl hover:border-blue-500 hover:bg-blue-50/50 transition-all font-bold text-slate-700 active:scale-98 bg-white flex justify-between items-center group"
          >
            <span>{opt.label}</span>
            <span className="text-slate-300 group-hover:text-blue-500 transition-colors">
              →
            </span>
          </button>
        ))}
      </div>

      <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
        <div
          className="bg-blue-600 h-full transition-all duration-500"
          style={{
            width: `${((currentQuestionIndex + 1) / FITNESS_QUESTIONS.length) * 100}%`,
          }}
        />
      </div>
    </motion.div>
  );
}
