import { supabase } from "@/lib/supabase";
import { StudentData } from "@/types/coach";
import { PostgrestResponse } from "@supabase/postgrest-js";

export const coachService = {
  /**
   * Получаем всех учеников тренера с их последними логами
   */
  async getStudents() {
    const { data, error } = (await supabase
      .from("coach_students")
      .select(
        `
        student:profiles!student_id (
          id,
          full_name,
          daily_logs ( 
            weight, steps, calories, sleep_hours, activity_level, log_date, water
          )
        )
      `,
      )
      .order("log_date", {
        foreignTable: "profiles.daily_logs",
        ascending: false,
      })) as PostgrestResponse<StudentData>;

    if (error) throw error;
    return data || [];
  },

  /**
   * Логика добавления ученика (поиск -> проверки -> привязка)
   */
  async addStudentByEmail(email: string, coachId: string) {
    const targetEmail = email.toLowerCase().trim();

    // 1. Поиск профиля
    const { data: student, error: searchError } = await supabase
      .from("profiles")
      .select("id, full_name, role")
      .eq("email", targetEmail)
      .single();

    if (searchError || !student)
      throw new Error("Пользователь с таким Email не найден");
    if (student.id === coachId)
      throw new Error("Вы не можете добавить самого себя");
    if (student.role !== "student")
      throw new Error("Этот пользователь — тренер");

    // 2. Проверка на существующую связь
    const { data: existing } = await supabase
      .from("coach_students")
      .select("id")
      .eq("coach_id", coachId)
      .eq("student_id", student.id)
      .maybeSingle();

    if (existing) throw new Error("Этот ученик уже есть в вашем списке");

    // 3. Создание записи
    const { error: linkError } = await supabase
      .from("coach_students")
      .insert({ coach_id: coachId, student_id: student.id });

    if (linkError) throw linkError;

    return student;
  },
};
