"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

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

  useEffect(() => {
    const getData = async () => {
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

      if (error) console.error("Ошибка:", error);
      if (data) setStudents(data as unknown as StudentData[]);
      setLoading(false);
    };
    getData();
  }, []);

  return (
    <div className="p-6 bg-slate-50 pt-24 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-black text-slate-800 mb-8 tracking-tight">
          Панель <span className="text-blue-600">Тренера</span>
        </h1>

        {loading ? (
          <p className="text-slate-500">Загрузка данных...</p>
        ) : (
          <div className="grid gap-6">
            {students.length === 0 && (
              <p className="text-slate-400 italic">
                Учеников пока нет или не настроены связи в БД.
              </p>
            )}

            {students.map((item, i) => (
              <div
                key={i}
                className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between"
              >
                <div>
                  <p className="text-lg font-bold text-slate-800">
                    {item.student.full_name}
                  </p>
                  <div className="flex gap-4 mt-1">
                    <span className="text-sm font-medium text-slate-500">
                      👣 {item.student.daily_logs?.[0]?.steps || 0} шагов
                    </span>
                    <span className="text-sm font-medium text-slate-500">
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
