import { useState, useMemo, useRef } from "react";
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
} from "@/lib/fitnessCalculators";

export function useSettingsForm(
  initialProfile: UserProfile | null,
  userId: string,
) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const normalizeGoal = (g: string | undefined): Goal => {
    if (g === "lose" || g === "lose_weight") return "lose_weight";
    if (g === "gain" || g === "gain_muscle") return "gain_muscle";
    return "maintain";
  };

  const getInitialBaseWater = (): string => {
    if (initialProfile?.water_target)
      return initialProfile.water_target.toString();
    const w = initialProfile?.weight || 70;
    const g = initialProfile?.gender || "female";
    const act = initialProfile?.activity_level || 1.2;
    let base = w * (g === "female" ? 30 : 35);
    if (act >= 1.725) base += 500;
    else if (act >= 1.55) base += 350;
    else if (act >= 1.375) base += 150;
    return (Math.round(base / 50) * 50).toString();
  };

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
    chest: initialProfile?.chest?.toString() || "",
    waist: initialProfile?.waist?.toString() || "",
    hips: initialProfile?.hips?.toString() || "",
    avatar_url: initialProfile?.avatar_url || "",
  });

  const currentAge = useMemo(() => {
    const age = getAgeFromBirthDate(formData.birth_date);
    return age > 0 ? age : 25;
  }, [formData.birth_date]);

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

  const updateField = (field: keyof typeof formData) => (value: string) => {
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
    const rawWater = formData.water_target;
    let processedWater = 2000;

    if (rawWater !== "" && rawWater !== undefined && rawWater !== null) {
      const sanitized =
        typeof rawWater === "string"
          ? rawWater.trim().replace(",", ".")
          : String(rawWater);
      processedWater = sanitized === "" ? 2000 : Math.round(Number(sanitized));
    }

    if (isNaN(processedWater) || processedWater < 1000) processedWater = 1000;
    if (processedWater > 5000) processedWater = 5000;

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
