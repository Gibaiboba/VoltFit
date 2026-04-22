import { supabase } from "@/lib/supabase";
import { AuthResponse } from "@supabase/supabase-js";

export const authService = {
  // Вход
  async signIn(email: string, password: string): Promise<AuthResponse["data"]> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  },

  // регистрация

  async signUp(
    email: string,
    password: string,
    fullName: string,
    role: "coach" | "student",
  ) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: role,
          onboarding_completed: false,
        },
      },
    });

    if (error) throw error;
    return data;
  },

  // Шаг 1: Отправка ссылки на почту
  async resetPassword(email: string) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    });

    if (error) throw error;
    return data;
  },

  // Шаг 2: Установка нового пароля
  async updatePassword(newPassword: string) {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) throw error;
    return data;
  },
};
