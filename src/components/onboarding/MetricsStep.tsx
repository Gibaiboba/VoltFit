"use client";

import { useForm, UseFormRegister } from "react-hook-form"; //FieldErrors было раньше, потом проверь для чего это
import { zodResolver } from "@hookform/resolvers/zod";
import { MetricsSchema, MetricsFormData } from "@/lib/schemas";
import { useOnboardingStore } from "@/store/useOnboardingStore";
import { motion } from "framer-motion";

// Типизируем пропсы для нашего инпута
interface InputProps {
  label: string;
  name: keyof MetricsFormData; // Гарантирует, что имя совпадает со схемой
  register: UseFormRegister<MetricsFormData>;
  error?: string;
  placeholder: string;
}

export default function MetricsStep() {
  const updateData = useOnboardingStore((state) => state.updateData);
  const nextStep = useOnboardingStore((state) => state.nextStep);
  const initialData = useOnboardingStore((state) => state.data);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<MetricsFormData>({
    resolver: zodResolver(MetricsSchema),
    mode: "onChange",
    defaultValues: {
      gender: initialData.gender || "male",
      age: initialData.age,
      height: initialData.height,
      weight: initialData.weight,
      target_weight: initialData.target_weight,
    },
  });

  const onSubmit = (data: MetricsFormData) => {
    updateData(data);
    nextStep();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md mx-auto space-y-6"
    >
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold">Твои параметры</h1>
        <p className="text-gray-500 text-sm italic">
          Используются для расчета КБЖУ
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Выбор пола */}
        <div className="flex gap-2 p-1.5 bg-gray-100 rounded-2xl">
          {(["male", "female"] as const).map((g) => (
            <label key={g} className="flex-1 cursor-pointer">
              <input
                type="radio"
                value={g}
                {...register("gender")}
                className="hidden peer"
              />
              <div className="text-center py-2.5 rounded-xl peer-checked:bg-white peer-checked:shadow-sm transition-all text-sm font-bold">
                {g === "male" ? "Мужчина" : "Женщина"}
              </div>
            </label>
          ))}
        </div>

        {/* Сетка инпутов */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Возраст"
            name="age"
            register={register}
            error={errors.age?.message}
            placeholder="25"
          />
          <Input
            label="Рост (см)"
            name="height"
            register={register}
            error={errors.height?.message}
            placeholder="175"
          />
          <Input
            label="Вес (кг)"
            name="weight"
            register={register}
            error={errors.weight?.message}
            placeholder="75"
          />
          <Input
            label="Цель (кг)"
            name="target_weight"
            register={register}
            error={errors.target_weight?.message}
            placeholder="70"
          />
        </div>

        <button
          type="submit"
          disabled={!isValid}
          className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 disabled:opacity-50 disabled:grayscale transition-all active:scale-[0.98]"
        >
          Далее
        </button>
      </form>
    </motion.div>
  );
}

function Input({ label, name, register, error, placeholder }: InputProps) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-bold text-gray-400 ml-3 uppercase tracking-wider">
        {label}
      </label>
      <input
        type="number"
        step="0.1"
        placeholder={placeholder}
        {...register(name, { valueAsNumber: true })}
        className={`w-full p-4 bg-gray-50 border-2 rounded-2xl outline-none focus:border-blue-500 transition-all placeholder:text-gray-300 font-medium ${
          error ? "border-red-200 bg-red-50" : "border-transparent"
        }`}
      />
      {error && (
        <p className="text-[10px] text-red-500 ml-3 font-semibold">{error}</p>
      )}
    </div>
  );
}
