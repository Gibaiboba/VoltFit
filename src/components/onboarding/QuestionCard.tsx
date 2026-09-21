"use client";
import { useState } from "react";
import { useOnboardingStore } from "@/store/useOnboardingStore";
import { useCoachOnboardingStore } from "@/store/useCoachOnboardingStore";
import { QuestionWrapper } from "./QuestionWrapper";
import { Option, Question } from "@/constants/questions";
import { MetricsSchema } from "@/lib/schemas";

interface QuestionCardProps {
  question: Question;
  isCoach?: boolean;
}

export const QuestionCard = ({
  question,
  isCoach = false,
}: QuestionCardProps) => {
  // Динамически выбираем нужный стор на основе роли
  const studentStore = useOnboardingStore();
  const coachStore = useCoachOnboardingStore();

  const currentStore = isCoach ? coachStore : studentStore;
  const { updateData, nextStep, setCurrentInsight, data } = currentStore;

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [localDate, setLocalDate] = useState("");

  const safeData = data as Record<string, string | number | undefined>;
  const currentValue = safeData[question.id] || "";
  const isBirthDateQuestion =
    question.type === "date" || question.id === "birth_date";

  const handleNext = () => {
    // Валидация через Zod для ученика (если есть схема)
    if (!isCoach) {
      const fieldSchema =
        MetricsSchema.shape[question.id as keyof typeof MetricsSchema.shape];
      if (fieldSchema) {
        const result = fieldSchema.safeParse(currentValue);
        if (!result.success) {
          setError(result.error.errors[0].message);
          return;
        }
      }
    } else {
      // Кастомная чистая валидация для тренера
      if (!currentValue || String(currentValue).trim() === "") {
        setError("Пожалуйста, заполните это поле");
        return;
      }
      if (
        ["experience_years", "height", "weight", "target_weight"].includes(
          question.id,
        )
      ) {
        const num = Number(currentValue);
        if (isNaN(num) || num <= 0) {
          setError("Введите корректное числовое значение больше нуля");
          return;
        }
      }
    }

    setError(null);
    nextStep();
  };

  const handleSelect = (option: Option) => {
    if (isProcessing) return;

    // Специфическая логика для селектора дедлайна
    if (question.type === "deadline_selector" && option.value === "event") {
      setShowDatePicker(true);
      return;
    }

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

  const handleConfirmDeadlineDate = () => {
    if (!localDate) return;

    const selectedDate = new Date(localDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate <= today) {
      setError("Пожалуйста, выберите дату в будущем");
      return;
    }

    setError(null);
    updateData({
      [question.id]: "event",
      target_date: localDate,
    });
    nextStep();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
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
        {/* КЕЙС 1: КАЛЕНДАРЬ ДЕДЛАЙНА */}
        {question.type === "deadline_selector" && showDatePicker ? (
          <div className="flex flex-col gap-4 animate-fadeIn">
            <div className="relative">
              <input
                type="date"
                value={localDate}
                className={`w-full p-5 bg-gray-50 border-2 rounded-2xl outline-none focus:border-blue-500 text-base font-bold py-6 text-gray-700 ${
                  error ? "border-red-400 bg-red-50" : "border-gray-100"
                }`}
                onChange={(e) => {
                  if (error) setError(null);
                  setLocalDate(e.target.value);
                }}
              />
            </div>
            {error && (
              <p className="text-red-500 text-xs font-bold px-4 uppercase tracking-wider">
                {error}
              </p>
            )}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowDatePicker(false);
                  setError(null);
                }}
                className="w-1/3 bg-gray-100 text-gray-700 p-5 rounded-2xl font-extrabold uppercase tracking-tight hover:bg-gray-200 transition-all text-xs"
              >
                Назад
              </button>
              <button
                onClick={handleConfirmDeadlineDate}
                disabled={!localDate}
                className="w-2/3 bg-blue-600 text-white p-5 rounded-2xl font-extrabold uppercase tracking-tight hover:bg-blue-700 active:scale-95 transition-all shadow-lg shadow-blue-100"
              >
                Подтвердить
              </button>
            </div>
          </div>
        ) : question.options ? (
          /* КЕЙС 2: ВЫБОР ВАРИАНТОВ (КНОПКИ) */
          question.options.map((opt: Option) => (
            <button
              key={opt.value}
              disabled={isProcessing}
              onClick={() => handleSelect(opt)}
              className="w-full p-5 text-left border-2 border-gray-100 rounded-2xl hover:border-blue-500 hover:bg-blue-50 transition-all font-bold text-gray-700 active:scale-95 flex justify-between items-center group bg-white"
            >
              <span>{opt.label}</span>
              <span className="text-gray-300 group-hover:text-blue-500 transition-colors">
                →
              </span>
            </button>
          ))
        ) : (
          /* КЕЙС 3: СТАНДАРТНЫЕ ИНПУТЫ */
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
              className="w-full bg-blue-600 text-white p-5 rounded-2xl font-extrabold uppercase tracking-tight hover:bg-blue-700 active:scale-95 transition-all shadow-lg shadow-blue-100"
            >
              Продолжить
            </button>
          </div>
        )}
      </div>
    </QuestionWrapper>
  );
};
