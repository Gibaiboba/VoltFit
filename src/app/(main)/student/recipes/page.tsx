"use client";
import { AnimatePresence } from "framer-motion";
import { useRecipes } from "@/hooks/recipes/useRecipes";
import { DietOnboarding } from "@/components/recipes/DietOnboarding";
import { RecipesDashboard } from "@/components/recipes/RecipesDashboard";

export default function RecipesPage() {
  const {
    isLoading,
    dietOnboardingCompleted,
    activeQuestions,
    localAnswers,
    userGlobalGoal,
    selectedCategory,
    contextTip,
    filteredRecipes,
    setSelectedCategory,
    handleSelectOption,
    handleReset,
  } = useRecipes();

  if (isLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6 mt-20 flex items-center justify-center text-slate-400 font-bold uppercase tracking-widest text-xs">
        Извлекаем фитнес-кэш рациона...
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 mt-20 text-slate-900 bg-slate-50 rounded-[40px] shadow-sm">
      <AnimatePresence mode="wait">
        {!dietOnboardingCompleted && activeQuestions.length > 0 ? (
          <DietOnboarding
            activeQuestions={activeQuestions}
            localAnswers={localAnswers}
            onSelectOption={handleSelectOption}
          />
        ) : (
          <RecipesDashboard
            userGlobalGoal={userGlobalGoal}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            contextTip={contextTip}
            filteredRecipes={filteredRecipes}
            onReset={handleReset}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
