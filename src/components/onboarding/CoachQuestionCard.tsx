"use client";

import { useState } from "react";
import { useCoachOnboardingStore } from "@/store/useCoachOnboardingStore";
import { QuestionWrapper } from "@/components/onboarding/QuestionWrapper"; // Переиспользуем красивую обертку
import { QuestionOption, Question } from "@/types/onboarding";

interface CoachQuestionCardProps {
  question: Question;
}

export const CoachQuestionCard = ({ question }: CoachQuestionCardProps) => {
  // Работаем СТРОГО со стором тренера
  const { updateData, nextStep, setCurrentInsight, data } =
    useCoachOnboardingStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Безопасное чтение данных без dynamic any
  const safeData = data as Record<string, string | number | undefined>;
  const currentValue = safeData[question.id] || "";
  const isBirthDateQuestion = question.id === "birth_date";

  const handleNext = () => {
    // Кастомная чистая валидация полей тренера на лету
    if (!currentValue || String(currentValue).trim() === "") {
      setError("Пожалуйста, заполните это поле");
      return;
    }

    if (
      question.id === "experience_years" ||
      question.id === "height" ||
      question.id === "weight" ||
      question.id === "target_weight"
    ) {
      const num = Number(currentValue);
      if (isNaN(num) || num <= 0) {
        setError("Введите корректное числовое значение больше нуля");
        return;
      }
    }

    setError(null);
    nextStep();
  };

  const handleSelect = (option: QuestionOption) => {
    if (isProcessing) return;

    // Записываем ответ в стор тренера
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

    // Дату рождения и текстовые поля оставляем строками, остальное приводим к числу
    const isTextField = question.id === "coach_bio";
    const finalValue =
      isBirthDateQuestion || isTextField ? val : val === "" ? "" : Number(val);

    if (error) setError(null);
    updateData({ [question.id]: finalValue });
  };
  return (
    <QuestionWrapper title={question.title} description={question.description}>
      <div
        className={`space-y-3 ${isProcessing ? "opacity-50 pointer-events-none" : ""}`}
      >
        {question.options ? (
          /* ВАРИАНТЫ ВЫБОРА (Селекторы) */
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
          /* Свободный ввод (Числа, Даты, Текст) */
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
