// export type Goal = "lose_weight" | "gain_muscle" | "maintain";
// export type Gender = "male" | "female";
// export type ActivityLevel = 1.2 | 1.375 | 1.55 | 1.725;
// export type BodyType = "ectomorph" | "mesomorph" | "endomorph";

// export interface OnboardingData {
//   // Базовые
//   goal: Goal;
//   gender: Gender;
//   age: number;
//   weight: number;
//   height: number;
//   target_weight: number;
//   activityLevel: ActivityLevel;
//   daily_calories?: number;
//   role?: "student" | "coach";

//   // Макронутриенты
//   protein?: number;
//   fat?: number;
//   carbs?: number;

//   // Ветка: Мышцы
//   bodyType?: BodyType;
//   massQuality?: "clean" | "fast";
//   trainingDays?: number;

//   // Ветка: ЗОЖ & Дефициты
//   energyLevel?: "tired_morning" | "afternoon_slump" | "stable";
//   skinHairStatus?: "dry" | "hair_loss" | "acne" | "normal";
//   symptoms?: string[]; // Тяга к сладкому, судороги и т.д.

//   // Результаты
//   recommendedProducts?: string[];
// }
// export interface QuestionOption {
//   label: string;
//   value: string | number;
//   insight?: string;
// }

// export interface Question {
//   id: string;
//   title: string;
//   description?: string;
//   type?: string;
//   unit?: string;
//   options?: QuestionOption[];
// }
export type Goal = "lose_weight" | "gain_muscle" | "maintain";
export type Gender = "male" | "female";
export type ActivityLevel = 1.2 | 1.375 | 1.55 | 1.725;
export type BodyType = "ectomorph" | "mesomorph" | "endomorph";

export interface OnboardingData {
  goal: Goal;
  gender: Gender;
  age: number;
  weight: number;
  height: number;
  target_weight: number;
  activityLevel: ActivityLevel;
  daily_calories?: number;
  protein?: number;
  fat?: number;
  carbs?: number;
  bodyType?: BodyType;
  massQuality?: "clean" | "fast";
  trainingDays?: number;
  energyLevel?: "tired_morning" | "afternoon_slump" | "stable";
  skinHairStatus?: "dry" | "hair_loss" | "acne" | "normal";
  symptoms?: string[];
  recommendedProducts?: string[];
}

export interface QuestionOption {
  label: string;
  value: string | number;
  insight?: string;
}

export interface Question {
  id: string;
  title: string;
  description?: string;
  type?: string;
  unit?: string;
  options?: QuestionOption[];
}
