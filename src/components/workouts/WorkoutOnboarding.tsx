"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Check, ArrowLeft } from "lucide-react";
import { FITNESS_QUESTIONS } from "@/constants/workout/fitnessQuestion";
import { FitnessAnswers } from "@/types/workout";

interface WorkoutOnboardingProps {
  userGender?: "male" | "female" | string;
  onCompleteOnboarding: (answers: FitnessAnswers) => void;
}

export default function WorkoutOnboarding({
  userGender = "male",
  onCompleteOnboarding,
}: WorkoutOnboardingProps) {
  // Фильтруем вопросы под пол пользователя
  const activeQuestions = useMemo(() => {
    return FITNESS_QUESTIONS.filter(
      (q) => !q.femaleOnly || userGender === "female",
    );
  }, [userGender]);

  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<FitnessAnswers>({});

  const currentQuestion = activeQuestions[stepIndex];
  const isLastStep = stepIndex === activeQuestions.length - 1;

  // Переход к следующему шагу или завершение
  const goNext = (updatedAnswers: FitnessAnswers) => {
    if (!isLastStep) {
      setStepIndex((prev) => prev + 1);
    } else {
      onCompleteOnboarding(updatedAnswers);
    }
  };

  // Обработка одиночного клика
  const handleSingleSelect = (value: string) => {
    const updated = { ...answers, [currentQuestion.id]: value };
    setAnswers(updated);
    goNext(updated);
  };

  // Обработка мультивыбора (с умной логикой для варианта "none")
  const handleMultipleToggle = (value: string) => {
    const currentSelected = (answers[currentQuestion.id] as string[]) || [];
    let nextSelected: string[];

    if (value === "none") {
      nextSelected = currentSelected.includes("none") ? [] : ["none"];
    } else {
      const withoutNone = currentSelected.filter((v) => v !== "none");
      nextSelected = withoutNone.includes(value)
        ? withoutNone.filter((v) => v !== value)
        : [...withoutNone, value];
    }

    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: nextSelected }));
  };

  const currentMultiValues = (answers[currentQuestion.id] as string[]) || [];
  const currentTextValue = (answers[currentQuestion.id] as string) || "";

  return (
    <motion.div
      key={currentQuestion.id}
      initial={{ opacity: 0, x: 15 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -15 }}
      transition={{ duration: 0.2 }}
      className="max-w-lg mx-auto bg-white p-6 sm:p-8 rounded-[36px] shadow-sm border border-slate-100 flex flex-col min-h-[460px] justify-between text-left"
    >
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-black uppercase text-blue-600 tracking-widest">
            Анкета • Шаг {stepIndex + 1} из {activeQuestions.length}
          </span>
          {stepIndex > 0 && (
            <button
              type="button"
              onClick={() => setStepIndex((p) => p - 1)}
              className="text-xs font-bold text-slate-400 hover:text-slate-700 inline-flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft size={14} /> Назад
            </button>
          )}
        </div>

        <h2 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight leading-tight">
          {currentQuestion.title}
        </h2>
        {currentQuestion.subtitle && (
          <p className="text-xs font-medium text-slate-400 mt-1">
            {currentQuestion.subtitle}
          </p>
        )}
      </div>

      {/* КОНТЕНТ В ЗАВИСИМОСТИ ОТ ТИПА ВОПРОСА */}
      <div className="my-6 flex-1 flex flex-col justify-center">
        {currentQuestion.type === "single" && (
          <div className="space-y-2.5">
            {currentQuestion.options?.map((opt) => {
              const isSelected = answers[currentQuestion.id] === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleSingleSelect(opt.value)}
                  className={`w-full p-4 text-left border-2 rounded-2xl transition-all font-bold text-sm flex justify-between items-center group cursor-pointer ${
                    isSelected
                      ? "border-blue-600 bg-blue-50/60 text-blue-900"
                      : "border-slate-100 hover:border-blue-400 hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  <span>{opt.label}</span>
                  <span className="text-slate-300 group-hover:text-blue-500">
                    →
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {currentQuestion.type === "multiple" && (
          <div className="space-y-4">
            <div className="space-y-2.5">
              {currentQuestion.options?.map((opt) => {
                const isChecked = currentMultiValues.includes(opt.value);
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleMultipleToggle(opt.value)}
                    className={`w-full p-4 text-left border-2 rounded-2xl transition-all font-bold text-sm flex justify-between items-center cursor-pointer ${
                      isChecked
                        ? "border-blue-600 bg-blue-50/60 text-blue-900"
                        : "border-slate-100 hover:border-slate-300 text-slate-700"
                    }`}
                  >
                    <span>{opt.label}</span>
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-colors ${
                        isChecked
                          ? "bg-blue-600 text-white"
                          : "border-2 border-slate-200"
                      }`}
                    >
                      {isChecked && <Check size={12} strokeWidth={3} />}
                    </div>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              disabled={currentMultiValues.length === 0}
              onClick={() => goNext(answers)}
              className="w-full h-12 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer"
            >
              Продолжить →
            </button>
          </div>
        )}

        {currentQuestion.type === "text" && (
          <div className="space-y-4">
            <textarea
              rows={4}
              value={currentTextValue}
              onChange={(e) =>
                setAnswers((prev) => ({
                  ...prev,
                  [currentQuestion.id]: e.target.value,
                }))
              }
              placeholder={currentQuestion.placeholder}
              className="w-full p-4 bg-slate-50 border-2 border-slate-200 focus:border-blue-500 focus:bg-white rounded-2xl text-sm font-medium text-slate-800 focus:outline-none transition-all resize-none"
            />

            <button
              type="button"
              onClick={() => goNext(answers)}
              className="w-full h-13 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-lg shadow-emerald-100 transition-all cursor-pointer"
            >
              Сформировать программу 🚀
            </button>
          </div>
        )}
      </div>

      {/* Прогресс-бар */}
      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
        <div
          className="bg-blue-600 h-full transition-all duration-300"
          style={{
            width: `${((stepIndex + 1) / activeQuestions.length) * 100}%`,
          }}
        />
      </div>
    </motion.div>
  );
}
