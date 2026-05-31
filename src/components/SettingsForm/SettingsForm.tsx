"use client";

import { useRef, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Camera,
  User as UserIcon,
  Save,
  Loader2,
  Activity,
} from "lucide-react";
import Image from "next/image";
import imageCompression from "browser-image-compression";
import Input from "@/components/shared/input";
import { UserProfile } from "@/types/user";

export default function SettingsForm({
  initialProfile,
  userId,
}: {
  initialProfile: UserProfile | null;
  userId: string;
}) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Локальное состояние формы
  const [formData, setFormData] = useState({
    full_name: initialProfile?.full_name || "",
    weight: initialProfile?.weight?.toString() || "",
    height: initialProfile?.height?.toString() || "",
    chest: initialProfile?.chest?.toString() || "",
    waist: initialProfile?.waist?.toString() || "",
    hips: initialProfile?.hips?.toString() || "",
    avatar_url: initialProfile?.avatar_url || "",
  });

  // 1. МУТАЦИЯ ДЛЯ ОБНОВЛЕНИЯ ПРОФИЛЯ
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
    onSuccess: (updatedData) => {
      queryClient.setQueryData(["user-profile", userId], updatedData);
      toast.success("Данные успешно сохранены!");

      if (updatedData.avatar_url) {
        setFormData((prev) => ({
          ...prev,
          avatar_url: updatedData.avatar_url!,
        }));
      }
    },
    onError: () => {
      toast.error("Ошибка при сохранении");
    },
  });

  const bmi = useMemo(() => {
    const w = parseFloat(formData.weight);
    const h = parseFloat(formData.height) / 100;
    if (w > 0 && h > 0) return (w / (h * h)).toFixed(1);
    return null;
  }, [formData.weight, formData.height]);

  const updateField = (field: keyof typeof formData) => (value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // 2. ЗАГРУЗКА ФОТО
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
      const urlWithTimestamp = `${publicUrl}?t=${Date.now()}`;

      updateProfile({ avatar_url: urlWithTimestamp });
      return "Фото обновлено!";
    };

    toast.promise(uploadPromise(), {
      loading: "Загружаем фото...",
      success: (msg) => msg,
      error: "Ошибка загрузки",
    });
  };

  const handleSaveAll = () => {
    updateProfile({
      full_name: formData.full_name || undefined,
      weight: parseFloat(formData.weight) || undefined,
      height: parseFloat(formData.height) || undefined,
      chest: parseFloat(formData.chest) || undefined,
      waist: parseFloat(formData.waist) || undefined,
      hips: parseFloat(formData.hips) || undefined,
    });
  };

  return (
    /* Убран сжимающий max-w-2xl, теперь блок занимает честные max-w-4xl из родителя */
    <div className="w-full space-y-6">
      {/* Главный блок формы с единым радиусом rounded-2xl и плоским брутальным стилем */}
      <div className="bg-white rounded-2xl p-6 border-2 border-slate-200">
        {/* Аватар по центру */}
        <div className="flex flex-col items-center mb-8">
          <div
            className="relative group cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-slate-200 bg-slate-50 relative">
              {formData.avatar_url ? (
                <Image
                  src={formData.avatar_url}
                  alt="Avatar"
                  fill
                  sizes="112px"
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <UserIcon size={40} className="text-slate-300" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Camera className="text-white" size={20} />
              </div>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleUpload}
              accept="image/*"
              className="hidden"
            />
          </div>
          <p className="mt-3 text-[10px] font-black uppercase text-slate-400 tracking-widest">
            Фото профиля
          </p>
        </div>

        {/* Поля ввода */}
        <div className="space-y-6">
          <Input
            label="Полное имя"
            type="text"
            value={formData.full_name}
            onChange={updateField("full_name")}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Рост (см)"
              value={formData.height}
              onChange={updateField("height")}
            />
            <Input
              label="Вес (кг)"
              value={formData.weight}
              onChange={updateField("weight")}
              step="0.1"
            />
          </div>

          {/* Виджет ИМТ перерисован под стиль "Индикаторов" приложения */}
          {bmi && (
            <div className="bg-blue-50 p-4 rounded-xl flex items-center justify-between border-2 border-blue-200">
              <div className="flex items-center gap-3 text-blue-900">
                <Activity size={18} className="text-blue-600" />
                <span className="text-xs font-black uppercase tracking-tight italic">
                  Индекс массы тела:
                </span>
              </div>
              <span className="text-xl font-black text-blue-700 italic">
                {bmi}
              </span>
            </div>
          )}

          {/* Обмеры тела */}
          <div className="pt-2 space-y-3">
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">
              Обмеры тела (см)
            </p>
            <div className="grid grid-cols-3 gap-4">
              <Input
                label="Грудь"
                value={formData.chest}
                onChange={updateField("chest")}
              />
              <Input
                label="Талия"
                value={formData.waist}
                onChange={updateField("waist")}
              />
              <Input
                label="Бедра"
                value={formData.hips}
                onChange={updateField("hips")}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Кнопка сохранения вынесена из карточки, как SaveButton на главной */}
      <button
        onClick={handleSaveAll}
        disabled={isUpdating}
        className="w-full h-14 bg-blue-600 text-white font-black text-sm uppercase tracking-wider rounded-xl border-b-4 border-blue-800 hover:bg-blue-500 active:border-b-0 active:mt-1 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {isUpdating ? (
          <Loader2 className="animate-spin" size={18} />
        ) : (
          <Save size={18} />
        )}
        Сохранить изменения
      </button>
    </div>
  );
}
