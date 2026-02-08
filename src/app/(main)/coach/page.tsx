"use client";
import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import AddStudentForm from "@/components/coach/AddStudentForm";

interface StudentLog {
  weight: number;
  steps: number;
  log_date: string;
}

interface StudentData {
  student: {
    full_name: string;
    daily_logs: StudentLog[];
  };
}

export default function CoachDashboard() {
  const [students, setStudents] = useState<StudentData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStudents = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("coach_students")
        .select(
          `
            student:profiles!student_id (
              full_name,
              daily_logs ( 
                weight, 
                steps, 
                log_date 
              )
            )
          `,
        )
        .order("log_date", {
          foreignTable: "profiles.daily_logs",
          ascending: false,
        });

      if (error) throw error;

      if (data) {
        setStudents(data as unknown as StudentData[]);
      }
    } catch (error) {
      console.error("Ошибка при загрузке учеников:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Запускаем эффект строго один раз при монтировании.
  useEffect(() => {
    fetchStudents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="p-6 bg-slate-50 pt-24 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-black text-slate-800 mb-8 tracking-tight">
          Панель <span className="text-blue-600">Тренера</span>
        </h1>

        <AddStudentForm onStudentAdded={fetchStudents} />

        {loading ? (
          <div className="flex justify-center p-12">
            <p className="text-slate-500 animate-pulse">Загрузка данных...</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {students.length === 0 ? (
              <div className="bg-white p-12 rounded-3xl border border-dashed border-slate-300 text-center">
                <p className="text-slate-400 italic">
                  Учеников пока нет. Добавьте первого ученика по email выше.
                </p>
              </div>
            ) : (
              students.map((item, i) => (
                <div
                  key={i}
                  className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-md transition-shadow"
                >
                  <div>
                    <p className="text-lg font-bold text-slate-800">
                      {item.student.full_name}
                    </p>
                    <div className="flex gap-4 mt-1">
                      <span className="text-sm font-medium text-slate-500 flex items-center gap-1">
                        👣 {item.student.daily_logs?.[0]?.steps || 0}
                      </span>
                      <span className="text-sm font-medium text-slate-500 flex items-center gap-1">
                        ⚖️ {item.student.daily_logs?.[0]?.weight || "—"} кг
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-xs text-slate-400 mb-2">
                      Последнее обновление:
                    </p>
                    <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-full">
                      {item.student.daily_logs?.[0]?.log_date || "Нет данных"}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
