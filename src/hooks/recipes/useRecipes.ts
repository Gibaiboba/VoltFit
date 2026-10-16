import { useState, useMemo } from "react";
import { useUserProfile } from "@/hooks/use-user-profile";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Goal } from "@/types/onboarding";
import { INTERNAL_DIET_QUESTIONS } from "@/constants/recipesQuestion";
import { MOCK_RECIPES_DATABASE } from "@/constants/recipesData";
import { OnboardingMetadata } from "@/types/user";

export function useRecipes() {
  const queryClient = useQueryClient();
  const { data: profile, isLoading } = useUserProfile();

  const [selectedCategory, setSelectedCategory] = useState<string>("Все");
  const [tempAnswers, setTempAnswers] = useState<Record<string, string>>({});
  const [isResetting, setIsResetting] = useState(false);

  const onboardingMetadata = useMemo<Partial<OnboardingMetadata>>(
    () => profile?.onboarding_metadata || {},
    [profile],
  );

  const dietOnboardingCompleted = useMemo(() => {
    if (isResetting) return false;
    return !!onboardingMetadata.diet_onboarding_completed;
  }, [onboardingMetadata.diet_onboarding_completed, isResetting]);

  const localAnswers = useMemo(() => {
    if (isResetting) return tempAnswers;
    return onboardingMetadata.diet_onboarding_completed
      ? onboardingMetadata.diet_answers || {}
      : tempAnswers;
  }, [
    onboardingMetadata.diet_onboarding_completed,
    onboardingMetadata.diet_answers,
    tempAnswers,
    isResetting,
  ]);

  const userGlobalGoal = (profile?.goal || "maintain") as Goal;
  const activeQuestions = INTERNAL_DIET_QUESTIONS[userGlobalGoal] || [];

  const { mutate: updateDietMetadata } = useMutation({
    mutationFn: async (newMetadata: OnboardingMetadata) => {
      if (!profile?.id) return;
      const { data, error } = await supabase
        .from("profiles")
        .update({ onboarding_metadata: newMetadata })
        .eq("id", profile.id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      setIsResetting(false);
      setTempAnswers({});
      queryClient.invalidateQueries({
        queryKey: ["user-profile", profile?.id],
      });
    },
    onError: () => {
      setIsResetting(false);
      toast.error("Не удалось сохранить кулинарные настройки");
    },
  });

  const handleSelectOption = (
    questionId: string,
    updatedAnswers: Record<string, string>,
  ) => {
    setTempAnswers(updatedAnswers);

    const isLastQuestion =
      Object.keys(updatedAnswers).length === activeQuestions.length;
    if (isLastQuestion) {
      const newMetadata = {
        ...onboardingMetadata,
        diet_onboarding_completed: true,
        diet_answers: updatedAnswers,
      };
      updateDietMetadata(newMetadata as OnboardingMetadata);
    }
  };

  const handleReset = () => {
    setIsResetting(true);
    const newMetadata = {
      ...onboardingMetadata,
      diet_onboarding_completed: false,
      diet_answers: {},
    };
    updateDietMetadata(newMetadata as OnboardingMetadata);
  };

  const filteredRecipes = useMemo(() => {
    return MOCK_RECIPES_DATABASE.filter((recipe) => {
      if (selectedCategory !== "Все" && recipe.category !== selectedCategory)
        return false;
      if (!recipe.goals.includes(userGlobalGoal)) return false;
      const currentDietType = localAnswers.diet_type;
      if (
        currentDietType &&
        currentDietType !== "everything" &&
        !recipe.dietTypes.includes(currentDietType)
      )
        return false;
      return true;
    });
  }, [selectedCategory, userGlobalGoal, localAnswers.diet_type]);

  const contextTip = useMemo(() => {
    if (
      userGlobalGoal === "lose_weight" &&
      onboardingMetadata.main_enemy === "sweets"
    ) {
      return "Так как ваш главный враг — тяга к сладкому, мы добавили в меню ужина продукты с магнием и хромом. Это заблокирует желание съесть десерт на ночь.";
    }
    if (
      userGlobalGoal === "gain_muscle" &&
      onboardingMetadata.appetite === "low"
    ) {
      return "Учитывая, что вам сложно съедать большие порции, мы добавили в меню калорийно-плотные смузи и боулы. Минимум объема — максимум пользы.";
    }
    if (
      userGlobalGoal === "maintain" &&
      onboardingMetadata.energy_level === "tired"
    ) {
      return "Ваше меню усилено железом (Fe) и ферментированными продуктами, чтобы устранить утреннюю утомляемость и запустить высокий уровень энергии.";
    }
    return "Ваше сбалансированное фитнес-меню на сегодня сформировано.";
  }, [
    userGlobalGoal,
    onboardingMetadata.main_enemy,
    onboardingMetadata.appetite,
    onboardingMetadata.energy_level,
  ]);

  return {
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
  };
}
