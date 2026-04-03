"use client";
import { useState } from "react";
import { useOnboardingStore } from "@/store/useOnboardingStore";
import { QuestionWrapper } from "./QuestionWrapper";
import { QuestionOption, Question } from "@/types/onboarding";
import { MetricsSchema } from "@/lib/schemas";

interface QuestionCardProps {
  question: Question;
}

export const QuestionCard = ({ question }: QuestionCardProps) => {
  const { updateData, nextStep, setCurrentInsight, data } =
    useOnboardingStore();
  const [isProcessing, setIsProcessing] = useState(false);

  // Стейт для хранения ошибки валидации
  const [error, setError] = useState<string | null>(null);

  const currentValue = data[question.id as keyof typeof data] || "";

  // Логика валидации перед переходом
  const handleNext = () => {
    // Проверяем, есть ли правила для этого ID в нашей Zod схеме
    const fieldSchema =
      MetricsSchema.shape[question.id as keyof typeof MetricsSchema.shape];

    if (fieldSchema) {
      const result = fieldSchema.safeParse(currentValue);
      if (!result.success) {
        // Если Zod вернул ошибку — записываем её текст в стейт
        setError(result.error.errors[0].message);
        return;
      }
    }

    // Если ошибок нет — идем дальше
    setError(null);
    nextStep();
  };

  const handleSelect = (option: QuestionOption) => {
    if (isProcessing) return;
    updateData({ [question.id]: option.value });

    if (option.insight) {
      setIsProcessing(true);
      setCurrentInsight(option.insight);
      setTimeout(() => {
        setCurrentInsight(null);
        setIsProcessing(false);
        nextStep();
      }, 2500);
    } else {
      nextStep();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const numericValue = val === "" ? "" : Number(val);

    // Сбрасываем ошибку, когда пользователь начал вводить заново
    if (error) setError(null);

    updateData({ [question.id]: numericValue });
  };

  return (
    <QuestionWrapper title={question.title} description={question.description}>
      <div
        className={`space-y-3 ${isProcessing ? "opacity-50 pointer-events-none" : ""}`}
      >
        {question.options ? (
          question.options.map((opt: QuestionOption) => (
            <button
              key={opt.value}
              disabled={isProcessing}
              onClick={() => handleSelect(opt)}
              className="w-full p-5 text-left border-2 border-gray-100 rounded-2xl hover:border-blue-500 hover:bg-blue-50 transition-all font-bold text-gray-700 active:scale-95 flex justify-between items-center group"
            >
              <span>{opt.label}</span>
              <span className="text-gray-300 group-hover:text-blue-500 transition-colors">
                →
              </span>
            </button>
          ))
        ) : (
          <div className="flex flex-col gap-4">
            <div className="relative">
              <input
                type="number"
                autoFocus
                value={currentValue}
                // Красная рамка при ошибке
                className={`w-full p-5 bg-gray-50 border-2 rounded-2xl outline-none focus:border-blue-500 text-2xl font-black transition-all ${
                  error ? "border-red-400 bg-red-50" : "border-gray-100"
                }`}
                placeholder="0"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && currentValue) handleNext();
                }}
                onChange={handleInputChange}
              />
              {/* Юнит (кг/см) справа в инпуте */}
              {question.unit && (
                <span className="absolute right-5 top-1/2 -translate-y-1/2 font-black text-gray-300 text-xl pointer-events-none">
                  {question.unit}
                </span>
              )}
            </div>

            {/* Вывод текста ошибки под инпутом */}
            {error && (
              <p className="text-red-500 text-xs font-bold px-4 uppercase tracking-wider animate-shake">
                {error}
              </p>
            )}

            <button
              onClick={handleNext}
              disabled={!currentValue}
              className="w-full bg-blue-600 text-white p-5 rounded-2xl font-extrabold uppercase tracking-tight hover:bg-blue-700 active:scale-95 transition-all shadow-lg shadow-blue-100 disabled:bg-gray-300 disabled:shadow-none"
            >
              Продолжить
            </button>
          </div>
        )}
      </div>
    </QuestionWrapper>
  );
};
