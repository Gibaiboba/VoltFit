"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import imageCompression from "browser-image-compression";
import { UserProfile } from "@/types/user";
import { Goal, ActivityLevel } from "@/types/onboarding";
import {
  getAgeFromBirthDate,
  calculateDailyCalories,
  calculateMacros,
  calculateBaseWaterTarget,
  calculateBaseStepsTarget,
} from "@/lib/fitnessCalculators";

export function useSettingsForm(
  initialProfile: UserProfile | null,
  userId: string,
) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Флаги, чтобы понимать, меняет ли пользователь воду/шаги руками
  const isUserEditingWater = useRef(!!initialProfile?.water_target);
  const isUserEditingSteps = useRef(!!initialProfile?.steps_target);

  const normalizeGoal = (g: string | undefined): Goal => {
    if (g === "lose" || g === "lose_weight") return "lose_weight";
    if (g === "gain" || g === "gain_muscle") return "gain_muscle";
    return "maintain";
  };

  // Безопасное извлечение метаданных онбординга
  const onboardingMetadata = useMemo(() => {
    return initialProfile?.onboarding_metadata || {};
  }, [initialProfile]);

  // Вспомогательный расчет стартовой базовой воды
  const getInitialBaseWater = (): string => {
    if (initialProfile?.water_target)
      return initialProfile.water_target.toString();

    const profileAge = getAgeFromBirthDate(initialProfile?.birth_date);
    const initialAge = profileAge > 0 ? profileAge : 25;

    const baseWaterLiters = calculateBaseWaterTarget({
      weight: initialProfile?.weight || 70,
      gender: (initialProfile?.gender as "male" | "female") || "female",
      age: initialAge,
      activityLevel: parseFloat(
        initialProfile?.activity_level?.toString() || "1.2",
      ),
    });

    return Math.round(baseWaterLiters * 1000).toString();
  };

  // Вспомогательный расчет стартовых шагов
  const getInitialBaseSteps = (): string => {
    if (initialProfile?.steps_target)
      return initialProfile.steps_target.toString();

    const baseSteps = calculateBaseStepsTarget({
      goal: normalizeGoal(initialProfile?.goal),
      activityLevel: parseFloat(
        initialProfile?.activity_level?.toString() || "1.2",
      ) as ActivityLevel,
    });

    return baseSteps.toString();
  };

  // ИНИЦИАЛИЗАЦИЯ СОСТОЯНИЯ ФОРМЫ
  const [formData, setFormData] = useState({
    full_name: initialProfile?.full_name || "",
    email: initialProfile?.email || "",
    gender: (initialProfile?.gender as "male" | "female") || "female",
    birth_date: initialProfile?.birth_date || "",
    goal: normalizeGoal(initialProfile?.goal),
    activity_level: initialProfile?.activity_level?.toString() || "1.2",
    weight: initialProfile?.weight?.toString() || "",
    height: initialProfile?.height?.toString() || "",
    target_weight: initialProfile?.target_weight?.toString() || "",
    target_date: onboardingMetadata.target_date || "",
    water_target: getInitialBaseWater(),
    steps_target: getInitialBaseSteps(),
    chest: initialProfile?.chest?.toString() || "",
    waist: initialProfile?.waist?.toString() || "",
    hips: initialProfile?.hips?.toString() || "",
    avatar_url: initialProfile?.avatar_url || "",
  });

  const age = getAgeFromBirthDate(formData.birth_date);
  const currentAge = age > 0 ? age : 25;

  // ОПРЕДЕЛЕНИЕ МУТАЦИИ ДЛЯ ОБНОВЛЕНИЯ ПРОФИЛЯ
  const { mutate: updateProfile, isPending: isUpdating } = useMutation({
    mutationFn: async (updates: Partial<UserProfile>) => {
      const { data, error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", userId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-profile", userId] });
      toast.success("Данные успешно сохранены!");
    },
    onError: () => toast.error("Ошибка при сохранении"),
  });

  // РЕАКТИВНЫЙ ПЕРЕСЧЕТ ВОДЫ И ШАГОВ
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const numericWeight = parseFloat(formData.weight) || 70;
    const numericActivity = (parseFloat(formData.activity_level) ||
      1.2) as ActivityLevel;

    if (!isUserEditingWater.current) {
      const baseWaterLiters = calculateBaseWaterTarget({
        weight: numericWeight,
        gender: formData.gender,
        age: currentAge,
        activityLevel: numericActivity,
      });
      const waterMl = Math.round(baseWaterLiters * 1000).toString();
      setFormData((prev) => ({ ...prev, water_target: waterMl }));
    }

    if (!isUserEditingSteps.current) {
      const baseSteps = calculateBaseStepsTarget({
        goal: formData.goal,
        activityLevel: numericActivity,
      }).toString();
      setFormData((prev) => ({ ...prev, steps_target: baseSteps }));
    }
  }, [
    formData.goal,
    formData.activity_level,
    formData.weight,
    formData.gender,
    currentAge,
  ]);

  // СИНХРОННЫЕ ВЫЧИСЛЕНИЯ КАЛОРИЙ И МАКРОСОВ
  const calculationResults = useMemo(() => {
    const numericWeight = parseFloat(formData.weight) || 70;
    const numericHeight = parseFloat(formData.height) || 170;
    const numericTargetWeight = parseFloat(formData.target_weight) || undefined;
    const numericActivity = parseFloat(formData.activity_level) || 1.2;

    return calculateDailyCalories({
      weight: numericWeight,
      height: numericHeight,
      age: currentAge,
      gender: formData.gender,
      activityLevel: numericActivity,
      goal: formData.goal,
      targetWeight: numericTargetWeight,
      targetDate: formData.target_date || undefined,
    });
  }, [
    formData.weight,
    formData.height,
    formData.target_weight,
    formData.target_date,
    formData.activity_level,
    formData.goal,
    formData.gender,
    currentAge,
  ]);

  const calculatedCalories = calculationResults.calories;

  const calculatedMacros = useMemo(() => {
    const numericWeight = parseFloat(formData.weight) || 70;
    if (calculatedCalories <= 0) return { protein: 0, fat: 0, carbs: 0 };
    return calculateMacros({
      weight: numericWeight,
      gender: formData.gender,
      goal: formData.goal,
      calories: calculatedCalories,
    });
  }, [formData.weight, formData.gender, formData.goal, calculatedCalories]);

  const bmi = useMemo(() => {
    const w = parseFloat(formData.weight);
    const h = parseFloat(formData.height) / 100;
    return w > 0 && h > 0 ? (w / (h * h)).toFixed(1) : null;
  }, [formData.weight, formData.height]);
  // ХЕНДЛЕРЫ ИЗМЕНЕНИЙ ВВОДА
  const handleWaterInputChange = (value: string) => {
    isUserEditingWater.current = true;
    setFormData((prev) => ({ ...prev, water_target: value }));
  };

  const handleStepsInputChange = (value: string) => {
    isUserEditingSteps.current = true;
    setFormData((prev) => ({ ...prev, steps_target: value }));
  };

  const updateField = (field: keyof typeof formData) => (value: string) => {
    if (field === "water_target") return handleWaterInputChange(value);
    if (field === "steps_target") return handleStepsInputChange(value);
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const uploadPromise = async () => {
      // 1. Сжимаем изображение на клиенте
      const options = {
        maxSizeMB: 0.1,
        maxWidthOrHeight: 400,
        useWebWorker: true,
      };
      const compressedFile = await imageCompression(file, options);

      const fileExt = file.name.split(".").pop() || "png";
      const newFileName = `avatar_${Date.now()}.${fileExt}`;
      const newFilePath = `${userId}/${newFileName}`;

      // 💡 2. Удаляем старый файл из Supabase Storage, если он существует
      if (formData.avatar_url) {
        try {
          // Вытаскиваем имя файла из текущего URL (все, что идет после названия бакета "/avatars/")
          const urlParts = formData.avatar_url.split("/avatars/");
          if (urlParts.length === 2) {
            const oldFilePath = urlParts[1].split("?")[0]; // Убираем query-параметры, если они были

            // Запускаем удаление старого файла
            await supabase.storage.from("avatars").remove([oldFilePath]);
          }
        } catch (sliceError) {
          // Ошибку удаления оборачиваем в try/catch, чтобы если файла не было или URL изменился,
          // это не ломало пользователю загрузку нового аватара.
          console.error("Не удалось удалить старый аватар:", sliceError);
        }
      }

      // 3. Загружаем новый уникальный файл
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(newFilePath, compressedFile, { upsert: true });
      if (uploadError) throw uploadError;

      // 4. Получаем новую чистую публичную ссылку
      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(newFilePath);

      // 5. Сохраняем в базу данных новый путь
      updateProfile({ avatar_url: publicUrl });

      return "Фото обновлено!";
    };

    toast.promise(uploadPromise(), {
      loading: "Загружаем фото...",
      success: (msg) => msg,
      error: "Ошибка загрузки",
    });

    toast.promise(uploadPromise(), {
      loading: "Загружаем фото...",
      success: (msg) => msg,
      error: "Ошибка загрузки",
    });
  };

  // СОХРАНЕНИЕ ДАННЫХ С ПРОВЕРКОЙ БЕЗОПАСНОСТИ ДАТЫ ТУТ
  const handleSaveAll = () => {
    const goalMap: Record<string, Goal> = {
      lose: "lose_weight",
      maintain: "maintain",
      gain: "gain_muscle",
    };

    let processedWater = 2000;
    if (formData.water_target) {
      const sanitized = formData.water_target.trim().replace(",", ".");
      processedWater = sanitized === "" ? 2000 : Math.round(Number(sanitized));
    }
    if (isNaN(processedWater) || processedWater < 1000) processedWater = 1000;
    if (processedWater > 5000) processedWater = 5000;

    let processedSteps = 8000;
    if (formData.steps_target) {
      const sanitizedSteps = formData.steps_target.trim();
      processedSteps =
        sanitizedSteps === "" ? 8000 : Math.round(Number(sanitizedSteps));
    }
    if (isNaN(processedSteps) || processedSteps < 1000) processedSteps = 1000;
    if (processedSteps > 50000) processedSteps = 50000;

    isUserEditingWater.current = false;
    isUserEditingSteps.current = false;

    const activeGoal = (goalMap[formData.goal] || formData.goal) as Goal;

    // ПРОВЕРКА КОРРЕКТИРОВКИ ДАТЫ:
    // Если калькулятор выявил опасный дефицит, мы берем его безопасную adjustedDate
    let finalTargetDate = formData.target_date;
    if (calculationResults.adjustedDate) {
      finalTargetDate = calculationResults.adjustedDate;
      // Меняем локальное состояние интерфейса, чтобы инпут даты тоже обновился
      setFormData((prev) => ({
        ...prev,
        target_date: calculationResults.adjustedDate!,
      }));
      // Уведомляем пользователя
      toast.warning(calculationResults.feedbackMessage);
    }

    const updatedMetadata = {
      ...onboardingMetadata,
      target_date:
        activeGoal === "lose_weight" ? finalTargetDate || undefined : undefined,
    };

    updateProfile({
      full_name: formData.full_name || undefined,
      goal: activeGoal,
      activity_level: Number(formData.activity_level) as ActivityLevel,
      weight: parseFloat(formData.weight) || undefined,
      height: parseFloat(formData.height) || undefined,
      target_weight: parseFloat(formData.target_weight) || undefined,
      chest: parseFloat(formData.chest) || undefined,
      waist: parseFloat(formData.waist) || undefined,
      hips: parseFloat(formData.hips) || undefined,
      daily_calories: calculatedCalories || undefined,
      protein: calculatedMacros.protein || undefined,
      fat: calculatedMacros.fat || undefined,
      carbs: calculatedMacros.carbs || undefined,
      water_target: processedWater,
      steps_target: processedSteps,
      onboarding_metadata: updatedMetadata,
    });
  };

  return {
    formData,
    setFormData,
    updateField,
    calculatedCalories,
    calculatedMacros,
    bmi,
    isUpdating,
    fileInputRef,
    handleUpload,
    handleSaveAll,
    currentAge,
  };
}
