"use client";

import { useForm, UseFormRegister } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MetricsSchema, MetricsFormData } from "@/lib/schemas";
import { useOnboardingStore } from "@/store/useOnboardingStore";
import { Gender } from "@/types/onboarding";
import { QuestionWrapper } from "./QuestionWrapper";

// Типизируем пропсы для инпута
interface InputProps {
  label: string;
  name: keyof MetricsFormData;
  register: UseFormRegister<MetricsFormData>;
  error?: string;
  placeholder: string;
}

export default function MetricsStep() {
  const updateData = useOnboardingStore((state) => state.updateData);
  const nextStep = useOnboardingStore((state) => state.nextStep);
  const initialData = useOnboardingStore((state) => state.data);

  // Список доступных полов для маппинга
  const genderOptions: Gender[] = ["male", "female"];

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<MetricsFormData>({
    resolver: zodResolver(MetricsSchema),
    mode: "onChange",
    defaultValues: {
      gender: (initialData.gender as Gender) || "male",
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
    <QuestionWrapper
      title="Твои параметры"
      description="Это база для расчета твоего метаболизма."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-4">
        {/* Выбор пола - Строгая типизация через genderOptions */}
        <div className="flex gap-2 p-1.5 bg-gray-100 rounded-2xl">
          {genderOptions.map((g) => (
            <label key={g} className="flex-1 cursor-pointer">
              <input
                type="radio"
                value={g}
                {...register("gender")}
                className="hidden peer"
              />
              <div className="text-center py-3 rounded-xl transition-all font-black uppercase text-xs tracking-widest peer-checked:bg-white peer-checked:text-blue-600 peer-checked:shadow-sm text-gray-400">
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
          className="w-full py-5 bg-blue-600 text-white rounded-3xl font-black uppercase tracking-widest hover:bg-blue-700 disabled:opacity-30 disabled:grayscale transition-all active:scale-[0.98] shadow-lg shadow-blue-100"
        >
          Продолжить
        </button>
      </form>
    </QuestionWrapper>
  );
}

// Вспомогательный компонент инпута
function Input({ label, name, register, error, placeholder }: InputProps) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black text-gray-400 ml-3 uppercase tracking-widest">
        {label}
      </label>
      <input
        type="number"
        step="0.1"
        placeholder={placeholder}
        {...register(name, { valueAsNumber: true })}
        className={`w-full p-4 bg-gray-50 border-2 rounded-2xl outline-none focus:border-blue-600 transition-all font-bold ${
          error ? "border-red-200 bg-red-50" : "border-transparent"
        }`}
      />
      {error && (
        <p className="text-[10px] text-red-500 ml-3 font-bold uppercase">
          {error}
        </p>
      )}
    </div>
  );
}
