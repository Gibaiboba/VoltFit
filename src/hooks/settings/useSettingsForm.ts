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

  // Флаги, чтобы понимать, меняет ли пользователь воду/шаги руками прямо сейчас
  const isUserEditingWater = useRef(false);
  const isUserEditingSteps = useRef(false);

  const normalizeGoal = (g: string | undefined): Goal => {
    if (g === "lose" || g === "lose_weight") return "lose_weight";
    if (g === "gain" || g === "gain_muscle") return "gain_muscle";
    return "maintain";
  };

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

  // 2. ИНИЦИАЛИЗАЦИЯ СОСТОЯНИЯ ФОРМЫ
  const [formData, setFormData] = useState({
    full_name: initialProfile?.full_name || "",
    email: initialProfile?.email || "",
    gender: (initialProfile?.gender as "male" | "female") || "female",
    birth_date: initialProfile?.birth_date || "",
    goal: normalizeGoal(initialProfile?.goal),
    activity_level: initialProfile?.activity_level?.toString() || "1.2",
    weight: initialProfile?.weight?.toString() || "",
    height: initialProfile?.height?.toString() || "",
    water_target: getInitialBaseWater(),
    steps_target: getInitialBaseSteps(),
    chest: initialProfile?.chest?.toString() || "",
    waist: initialProfile?.waist?.toString() || "",
    hips: initialProfile?.hips?.toString() || "",
    avatar_url: initialProfile?.avatar_url || "",
  });

  // 3. ВЫЧИСЛЕHИЕ ТЕКУЩЕГО ВОЗРАСТА
  const age = getAgeFromBirthDate(formData.birth_date);
  const currentAge = age > 0 ? age : 25;

  // 4. РЕАКТИВНЫЙ ПЕРЕСЧЕТ ВОДЫ И ШАГОВ НА ЛЕТУ ПРИ СМЕНЕ СЕЛЕКТОРОВ
  useEffect(() => {
    const numericWeight = parseFloat(formData.weight) || 70;
    const numericActivity = (parseFloat(formData.activity_level) ||
      1.2) as ActivityLevel;

    // Пересчитываем воду, если пользователь не заблокировал ее ручным вводом
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

    // Пересчитываем шаги, если пользователь не заблокировал их ручным вводом
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

  const calculatedCalories = useMemo(() => {
    const numericWeight = parseFloat(formData.weight) || 70;
    const numericHeight = parseFloat(formData.height) || 170;
    const numericActivity = parseFloat(formData.activity_level) || 1.2;
    return calculateDailyCalories({
      weight: numericWeight,
      height: numericHeight,
      age: currentAge,
      gender: formData.gender,
      activityLevel: numericActivity,
      goal: formData.goal,
    });
  }, [
    formData.weight,
    formData.height,
    formData.activity_level,
    formData.goal,
    formData.gender,
    currentAge,
  ]);

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

  // Кастомные хендлеры для инпутов, чтобы отслеживать ручное изменение
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
      const options = {
        maxSizeMB: 0.1,
        maxWidthOrHeight: 400,
        useWebWorker: true,
      };
      const compressedFile = await imageCompression(file, options);
      const filePath = `${userId}/avatar.png`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, compressedFile, { upsert: true });
      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(filePath);
      updateProfile({ avatar_url: `${publicUrl}?t=${Date.now()}` });
      return "Фото обновлено!";
    };

    toast.promise(uploadPromise(), {
      loading: "Загружаем фото...",
      success: (msg) => msg,
      error: "Ошибка загрузки",
    });
  };

  const handleSaveAll = () => {
    const goalMap: Record<string, Goal> = {
      lose: "lose_weight",
      maintain: "maintain",
      gain: "gain_muscle",
    };

    // Санитизация воды
    let processedWater = 2000;
    if (formData.water_target) {
      const sanitized = formData.water_target.trim().replace(",", ".");
      processedWater = sanitized === "" ? 2000 : Math.round(Number(sanitized));
    }
    if (isNaN(processedWater) || processedWater < 1000) processedWater = 1000;
    if (processedWater > 5000) processedWater = 5000;

    // Санитизация шагов
    let processedSteps = 8000;
    if (formData.steps_target) {
      const sanitizedSteps = formData.steps_target.trim();
      processedSteps =
        sanitizedSteps === "" ? 8000 : Math.round(Number(sanitizedSteps));
    }
    if (isNaN(processedSteps) || processedSteps < 1000) processedSteps = 1000;
    if (processedSteps > 50000) processedSteps = 50000;

    // После сохранения сбрасываем ручные триггеры, чтобы формулы ожили при следующем рендере
    isUserEditingWater.current = false;
    isUserEditingSteps.current = false;

    updateProfile({
      full_name: formData.full_name || undefined,
      goal: (goalMap[formData.goal] || formData.goal) as Goal,
      activity_level: Number(formData.activity_level) as ActivityLevel,
      weight: parseFloat(formData.weight) || undefined,
      height: parseFloat(formData.height) || undefined,
      chest: parseFloat(formData.chest) || undefined,
      waist: parseFloat(formData.waist) || undefined,
      hips: parseFloat(formData.hips) || undefined,
      daily_calories: calculatedCalories || undefined,
      protein: calculatedMacros.protein || undefined,
      fat: calculatedMacros.fat || undefined,
      carbs: calculatedMacros.carbs || undefined,
      water_target: processedWater,
      steps_target: processedSteps,
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
