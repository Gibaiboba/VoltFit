import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

interface Question {
  id: string;
  title: string;
  description?: string;
  options: { value: string | number; label: string }[];
}

interface DietOnboardingProps {
  activeQuestions: Question[];
  localAnswers: Record<string, string>;
  onSelectOption: (
    questionId: string,
    updatedAnswers: Record<string, string>,
  ) => void;
}

export function DietOnboarding({
  activeQuestions,
  localAnswers,
  onSelectOption,
}: DietOnboardingProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentQuestion = activeQuestions[currentIndex];

  if (!currentQuestion) return null;

  const handleSelect = (value: string) => {
    const updatedAnswers = { ...localAnswers, [currentQuestion.id]: value };

    if (currentIndex < activeQuestions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
    // Передаем изменения «наверх» при каждом клике, контейнер сам решит, когда завершить опрос
    onSelectOption(currentQuestion.id, updatedAnswers);
  };

  return (
    <motion.div
      key="diet-onboarding"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      className="max-w-md mx-auto bg-white p-8 rounded-[36px] shadow-sm border border-slate-100 flex flex-col min-h-[420px] justify-between text-left"
    >
      <div>
        <span className="text-[10px] font-black uppercase text-emerald-500 tracking-widest">
          Настройка меню • Шаг {currentIndex + 1} из {activeQuestions.length}
        </span>
        <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight mt-2 leading-tight">
          {currentQuestion.title}
        </h2>
        {currentQuestion.description && (
          <p className="text-xs font-medium text-slate-400 mt-1">
            {currentQuestion.description}
          </p>
        )}
      </div>

      <div className="space-y-3 my-6">
        {currentQuestion.options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => handleSelect(String(opt.value))}
            className="w-full p-5 text-left border-2 border-slate-100 rounded-2xl hover:border-emerald-500 hover:bg-emerald-50/50 transition-all font-bold text-slate-700 active:scale-98 bg-white flex justify-between items-center group"
          >
            <span>{opt.label}</span>
            <span className="text-slate-300 group-hover:text-emerald-500 transition-colors">
              <ArrowRight size={16} />
            </span>
          </button>
        ))}
      </div>

      <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
        <div
          className="bg-emerald-500 h-full transition-all duration-500"
          style={{
            width: `${((currentIndex + 1) / activeQuestions.length) * 100}%`,
          }}
        />
      </div>
    </motion.div>
  );
}
