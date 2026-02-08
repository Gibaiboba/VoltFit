"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function StudentPage() {
  const [steps, setSteps] = useState(0);
  const [weight, setWeight] = useState("");

  const handleSave = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return alert("Вы не авторизованы");

    const { error } = await supabase.from("daily_logs").upsert({
      user_id: user.id,
      log_date: new Date().toISOString().split("T")[0],
      steps: steps,
      weight: parseFloat(weight),
    });

    if (error) {
      console.error("RLS Error:", error);
      alert("Ошибка: " + error.message);
    } else {
      alert("✅ Данные успешно сохранены!");
    }
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen flex items-center pt-24 justify-center">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-slate-200/60 p-8 border border-slate-100">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">
            Volt<span className="text-blue-600">Fit</span>
          </h1>
          <p className="text-slate-400 mt-2 font-medium">Дневник активности</p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">
              Сколько шагов прошли?
            </label>
            <input
              type="number"
              placeholder="Напр: 10000"
              className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl outline-none transition-all text-slate-800 font-semibold"
              onChange={(e) => setSteps(parseInt(e.target.value))}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">
              Текущий вес (кг)
            </label>
            <input
              type="number"
              step="0.1"
              placeholder="Напр: 75.5"
              className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl outline-none transition-all text-slate-800 font-semibold"
              onChange={(e) => setWeight(e.target.value)}
            />
          </div>

          <button
            onClick={handleSave}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-bold rounded-2xl shadow-lg shadow-blue-200 transition-all mt-4 uppercase tracking-wider"
          >
            Отправить отчет
          </button>
        </div>

        <p className="text-center text-xs text-slate-400 mt-8">
          Данные будут моментально доступны вашему тренеру
        </p>
      </div>
    </div>
  );
}
