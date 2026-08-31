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
  const [error, setError] = useState<string | null>(null);

  const currentValue = data[question.id as keyof typeof data] || "";
  const isBirthDateQuestion = question.id === "birth_date";

  const handleNext = () => {
    const fieldSchema =
      MetricsSchema.shape[question.id as keyof typeof MetricsSchema.shape];
    if (fieldSchema) {
      const result = fieldSchema.safeParse(currentValue);
      if (!result.success) {
        setError(result.error.errors[0].message);
        return;
      }
    }
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
    const finalValue = isBirthDateQuestion
      ? val
      : val === ""
        ? ""
        : Number(val);
    if (error) setError(null);
    updateData({ [question.id]: finalValue });
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
                type={isBirthDateQuestion ? "date" : "number"}
                autoFocus
                value={currentValue}
                className={`w-full p-5 bg-gray-50 border-2 rounded-2xl outline-none focus:border-blue-500 text-2xl font-black transition-all ${
                  error ? "border-red-400 bg-red-50" : "border-gray-100"
                } ${isBirthDateQuestion ? "text-base font-bold py-6 text-gray-700" : ""}`}
                placeholder={isBirthDateQuestion ? "" : "0"}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && currentValue) handleNext();
                }}
                onChange={handleInputChange}
              />
              {!isBirthDateQuestion && question.unit && (
                <span className="absolute right-5 top-1/2 -translate-y-1/2 font-black text-gray-300 text-xl pointer-events-none">
                  {question.unit}
                </span>
              )}
            </div>
            {error && (
              <p className="text-red-500 text-xs font-bold px-4 uppercase tracking-wider">
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
