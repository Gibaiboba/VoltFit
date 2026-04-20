import { supabase } from "@/lib/supabase";
import { AuthResponse, AuthError } from "@supabase/supabase-js";

/**
 * Универсальный обработчик ошибок
 * Преобразует технические ошибки Supabase и JS в понятные пользователю сообщения.
 */
export const getErrorMessage = (error: unknown): string => {
  // 1. Ошибки Supabase Auth (AuthError)
  if (error instanceof AuthError) {
    // Сначала проверяем конкретные коды (они точнее статусов)
    switch (error.code) {
      case "invalid_credentials":
        return "Неверный Email или пароль";
      case "email_not_confirmed":
        return "Пожалуйста, подтвердите ваш Email";
      case "weak_password":
        return "Пароль слишком простой (минимум 6 символов)";
      case "user_not_found":
        return "Пользователь с таким Email не найден";
      case "email_exists":
        return "Этот Email уже занят другим пользователем";
      case "over_email_send_rate_limit":
      case "over_request_rate_limit":
        return "Слишком много запросов. Попробуйте позже";
      case "validation_failed":
        return "Проверьте правильность введенных данных";
    }

    // Если код неизвестен, проверяем HTTP статус
    switch (error.status) {
      case 422:
        return "Ошибка валидации данных на сервере";
      case 429:
        return "Слишком много попыток. Пожалуйста, подождите";
      case 500:
      case 502:
      case 503:
        return "Проблема на стороне сервера. Мы уже чиним!";
    }

    // Если ни код, ни статус не дали совпадений — возвращаем системное сообщение
    return error.message || "Произошла ошибка авторизации";
  }

  // 2. Стандартные ошибки JavaScript (Network errors и ручные throw new Error)
  if (error instanceof Error) {
    // Обработка сетевых проблем (fetch может упасть до получения AuthError)
    if (
      error.message.includes("fetch") ||
      error.message.includes("network") ||
      error.message.includes("Failed to fetch")
    ) {
      return "Ошибка сети. Проверьте соединение с интернетом";
    }
    return error.message;
  }

  // 3. Гарантированный fallback для любых других случаев (string, null, undefined)
  if (typeof error === "string") return error;

  return "Произошла непредвиденная ошибка. Попробуйте позже";
};

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
