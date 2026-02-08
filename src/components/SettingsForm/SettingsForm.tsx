"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useUserStore, UserProfile } from "@/store/useUserStore";
import { toast } from "sonner";
import { Camera, User as UserIcon, Save, Loader2 } from "lucide-react";
import Image from "next/image";
import imageCompression from "browser-image-compression";

interface SettingsFormProps {
  initialProfile: UserProfile | null;
  userId: string;
}

export default function SettingsForm({
  initialProfile,
  userId,
}: SettingsFormProps) {
  // Используем setProfile для мгновенного обновления Header через Zustand
  const { setProfile, profile } = useUserStore();

  const [fullNameInput, setFullNameInput] = useState(
    initialProfile?.full_name || "",
  );
  const [avatarUrl, setAvatarUrl] = useState(initialProfile?.avatar_url || "");
  const [isUpdating, setIsUpdating] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialProfile && !profile) {
      setProfile(initialProfile);
    }
  }, [initialProfile, profile, setProfile]);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;

      const uploadPromise = async () => {
        // Настройки сжатия
        const options = {
          maxSizeMB: 0.1,
          maxWidthOrHeight: 200,
          useWebWorker: true,
          initialQuality: 0.8,
        };

        // Сжатие файла
        const compressedFile = await imageCompression(file, options);

        // Фиксированный путь для перезаписи (всегда один файл на юзера)
        const filePath = `${userId}/avatar.png`;

        // Загрузка в Supabase (upsert: true перезаписывает старый файл)
        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(filePath, compressedFile, {
            upsert: true,
            contentType: compressedFile.type,
          });

        if (uploadError) throw uploadError;

        // Получаем URL и добавляем Timestamp (?t=...), чтобы Header увидел изменения
        const {
          data: { publicUrl },
        } = supabase.storage.from("avatars").getPublicUrl(filePath);
        const urlWithTimestamp = `${publicUrl}?t=${Date.now()}`;

        // Обновляем БД и Zustand
        const { data: updatedProfile, error: updateError } = await supabase
          .from("profiles")
          .update({ avatar_url: urlWithTimestamp })
          .eq("id", userId)
          .select()
          .single();

        if (updateError) throw updateError;

        if (updatedProfile) {
          setAvatarUrl(updatedProfile.avatar_url || "");
          setProfile(updatedProfile);
        }

        return "Аватар оптимизирован и обновлен!";
      };

      toast.promise(uploadPromise(), {
        loading: "Сжимаем и загружаем...",
        success: (msg) => msg,
        error: "Ошибка при обработке фото",
      });
    } catch (error) {
      console.error("Compression error:", error);
    }
  };

  const handleUpdateName = async () => {
    setIsUpdating(true);

    const { data: updatedProfile, error } = await supabase
      .from("profiles")
      .update({ full_name: fullNameInput })
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      toast.error("Ошибка при обновлении");
    } else if (updatedProfile) {
      setProfile(updatedProfile);
      toast.success("Профиль успешно обновлен!");
    }
    setIsUpdating(false);
  };

  return (
    <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
      <div className="flex flex-col items-center mb-10">
        <div
          className="relative group cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-slate-50 bg-slate-100 flex items-center justify-center relative">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt="Avatar"
                height={128}
                width={128}
                className="w-full h-full object-cover"
                priority
              />
            ) : (
              <UserIcon size={48} className="text-slate-300" />
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
        <p className="mt-4 text-sm text-slate-400 font-medium">
          Нажмите на фото, чтобы изменить его
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">
            Полное имя
          </label>
          <div className="relative">
            <input
              type="text"
              value={fullNameInput}
              onChange={(e) => setFullNameInput(e.target.value)}
              className="w-full p-4 pl-12 bg-slate-50 rounded-2xl outline-none focus:border-blue-500 border-2 border-transparent transition-all text-slate-800"
              placeholder="Как вас зовут?"
            />
            <UserIcon
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              size={20}
            />
          </div>
        </div>

        <button
          onClick={handleUpdateName}
          disabled={isUpdating}
          className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 disabled:bg-slate-200 flex items-center justify-center gap-2"
        >
          {isUpdating ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            <Save size={20} />
          )}
          Сохранить изменения
        </button>
      </div>
    </div>
  );
}
