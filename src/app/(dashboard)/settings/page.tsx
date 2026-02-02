"use client";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import { toast } from "sonner";
import { Camera, User as UserIcon, Save, Loader2 } from "lucide-react";
import Image from "next/image";

export default function SettingsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [fullName, setFullName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function getProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        // Сначала пробуем взять имя из метаданных, потом из таблицы profiles
        setFullName(user.user_metadata?.full_name || "");

        const { data: profile } = await supabase
          .from("profiles")
          .select("avatar_url, full_name")
          .eq("id", user.id)
          .single();

        if (profile) {
          setAvatarUrl(profile.avatar_url);
          if (profile.full_name) setFullName(profile.full_name);
        }
      }
    }
    getProfile();
  }, []);

  // ЛОГИКА ЗАГРУЗКИ АВАТАРА
  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file || !user) return;

      const fileExt = file.name.split(".").pop();
      const filePath = `${user.id}/avatar-${Math.random()}.${fileExt}`; // уникальный путь

      const uploadPromise = async () => {
        // 1. Загрузка в Storage
        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(filePath, file, { upsert: true });

        if (uploadError) throw uploadError;

        // 2. Получение ссылки
        const {
          data: { publicUrl },
        } = supabase.storage.from("avatars").getPublicUrl(filePath);

        // 3. Обновление в БД
        const { error: updateError } = await supabase
          .from("profiles")
          .update({ avatar_url: publicUrl })
          .eq("id", user.id);

        if (updateError) throw updateError;
        setAvatarUrl(publicUrl);
        return "Аватар обновлен!";
      };

      toast.promise(uploadPromise(), {
        loading: "Загружаем фото...",
        success: (msg) => msg,
        error: "Не удалось загрузить фото",
      });
    } catch (error) {
      console.error(error);
    }
  };

  // СОХРАНЕНИЕ ИМЕНИ
  const updateProfile = async () => {
    setLoading(true);
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName })
      .eq("id", user?.id);

    if (error) {
      toast.error("Ошибка при обновлении");
    } else {
      toast.success("Профиль успешно обновлен!");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto pt-10 px-4">
      <h1 className="text-3xl font-black text-slate-800 mb-10">
        Настройки профиля
      </h1>

      <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
        {/* СЕКЦИЯ АВАТАРА */}
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
                />
              ) : (
                <UserIcon size={48} className="text-slate-300" />
              )}
              {/* Оверлей при наведении */}
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

        {/* СЕКЦИЯ ДАННЫХ */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">
              Полное имя
            </label>
            <div className="relative">
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full p-4 pl-12 bg-slate-50 rounded-2xl outline-none focus:border-blue-500 border-2 border-transparent transition-all"
                placeholder="Как вас зовут?"
              />
              <UserIcon
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                size={20}
              />
            </div>
          </div>

          <button
            onClick={updateProfile}
            disabled={loading}
            className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 disabled:bg-slate-200 flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <Save size={20} />
            )}
            Сохранить изменения
          </button>
        </div>
      </div>
    </div>
  );
}
