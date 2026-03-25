"use client";
import { useState } from "react"; // для локального контроля блокировки
import { useOnboardingStore } from "@/store/useOnboardingStore";
import { QuestionWrapper } from "./QuestionWrapper";
import { QuestionOption, Question } from "@/types/onboarding";

interface QuestionCardProps {
  question: Question;
}

export const QuestionCard = ({ question }: QuestionCardProps) => {
  // 1. Достаем data, чтобы сделать инпут "управляемым"
  const { updateData, nextStep, setCurrentInsight, data } =
    useOnboardingStore();

  // Локальный стейт для предотвращения двойных кликов во время показа инсайта
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSelect = (option: QuestionOption) => {
    if (isProcessing) return; // Блокировка повторного клика

    updateData({ [question.id]: option.value });

    if (option.insight) {
      setIsProcessing(true); // Включаем режим ожидания
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

    // Если инпут пустой, не превращаем его в 0 (Number("") === 0),
    // чтобы не ломать логику формул в сторе. Сохраняем null или пустую строку.
    const numericValue = val === "" ? "" : Number(val);
    updateData({ [question.id]: numericValue });
  };

  // 3. БЕРЕМ ЗНАЧЕНИЕ ИЗ СТОРА: Чтобы при возврате назад данные были на месте
  const currentValue = data[question.id as keyof typeof data] || "";

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
            <input
              type="number"
              autoFocus
              value={currentValue}
              className="w-full p-5 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:border-blue-500 text-2xl font-black transition-all"
              placeholder="0"
              onKeyDown={(e) => {
                // Добавили проверку, чтобы нельзя было уйти с пустым полем
                if (e.key === "Enter" && currentValue) nextStep();
              }}
              onChange={handleInputChange}
            />
            <button
              onClick={nextStep}
              disabled={!currentValue} // 6. ВАЛИДАЦИЯ: Кнопка не активна, пока поле пустое
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
