"use client";
import { useEffect, useRef, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { useUserStore, UserProfile } from "@/store/useUserStore";
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

export default function SettingsForm({
  initialProfile,
  userId,
}: {
  initialProfile: UserProfile | null;
  userId: string;
}) {
  const { setProfile, profile } = useUserStore();
  const [isUpdating, setIsUpdating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Инициализируем Zustand, если он пуст (при прямой загрузке страницы)
  useEffect(() => {
    if (initialProfile && !profile) {
      setProfile(initialProfile);
    }
  }, [initialProfile, profile, setProfile]);

  // Единое состояние для всех текстовых полей
  const [formData, setFormData] = useState({
    full_name: initialProfile?.full_name || "",
    weight: initialProfile?.weight?.toString() || "",
    height: initialProfile?.height?.toString() || "",
    chest: initialProfile?.chest?.toString() || "",
    waist: initialProfile?.waist?.toString() || "",
    hips: initialProfile?.hips?.toString() || "",
  });

  // Расчет ИМТ через useMemo (пересчитывается только при изменении веса/роста)
  const bmi = useMemo(() => {
    const w = parseFloat(formData.weight);
    const h = parseFloat(formData.height) / 100;
    if (w > 0 && h > 0) return (w / (h * h)).toFixed(1);
    return null;
  }, [formData.weight, formData.height]);

  // каррированный обработчик для всех полей
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

      // Загрузка
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, compressedFile, { upsert: true });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(filePath);
      const urlWithTimestamp = `${publicUrl}?t=${Date.now()}`;

      // Обновляем профиль в БД
      const { data: updated, error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: urlWithTimestamp })
        .eq("id", userId)
        .select()
        .single();

      if (updateError) throw updateError;
      setProfile(updated); // Обновляем глобальный стор (Header подхватит фото)
      return "Фото обновлено!";
    };

    toast.promise(uploadPromise(), {
      loading: "Сжимаем и загружаем...",
      success: (msg) => msg,
      error: "Ошибка при загрузке",
    });
  };

  const handleUpdateProfile = async () => {
    setIsUpdating(true);
    const { data, error } = await supabase
      .from("profiles")
      .update({
        full_name: formData.full_name,
        weight: parseFloat(formData.weight) || null,
        height: parseFloat(formData.height) || null,
        chest: parseFloat(formData.chest) || null,
        waist: parseFloat(formData.waist) || null,
        hips: parseFloat(formData.hips) || null,
      })
      .eq("id", userId)
      .select()
      .single();

    if (!error && data) {
      setProfile(data);
      toast.success("Данные успешно сохранены!");
    } else {
      toast.error("Ошибка при сохранении");
    }
    setIsUpdating(false);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-[40px] p-8 shadow-sm border border-slate-100">
        {/* Аватар */}
        <div className="flex flex-col items-center mb-10">
          <div
            className="relative group cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-slate-50 bg-slate-100 relative">
              {profile?.avatar_url ? (
                <Image
                  src={profile.avatar_url}
                  alt="Avatar"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 128px, 150px"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <UserIcon size={48} className="text-slate-300" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Camera className="text-white" size={24} />
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
          <p className="mt-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">
            Фото профиля
          </p>
        </div>

        {/* Форма */}
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

          {/* ИМТ Виджет */}
          {bmi && (
            <div className="bg-blue-50 p-5 rounded-3xl flex items-center justify-between border border-blue-100">
              <div className="flex items-center gap-3 text-blue-800">
                <Activity size={20} />
                <span className="text-sm font-bold">Индекс массы тела:</span>
              </div>
              <span className="text-2xl font-black text-blue-600">{bmi}</span>
            </div>
          )}

          {/* Объемы */}
          <div className="pt-4 space-y-4">
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-2">
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

          <button
            onClick={handleUpdateProfile}
            disabled={isUpdating}
            className="w-full py-5 bg-blue-600 text-white font-black rounded-[24px] hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50"
          >
            {isUpdating ? (
              <Loader2 className="animate-spin" />
            ) : (
              <Save size={20} />
            )}
            Сохранить профиль
          </button>
        </div>
      </div>
    </div>
  );
}
