"use client";

import { Activity, Utensils, Dumbbell, User } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import FoodConstructor from "@/components/food/food-constructor";
import { ActivityModal } from "@/components/student/activity-modal";
import { useTabsLayoutLogic } from "@/hooks/use-tabs-layout-logic";
import { StudentQuickMenu } from "@/components/student/student-quick-menu";
import { StudentBottomBar } from "@/components/student/student-bottom-bar";
import { useUserProfile } from "@/hooks/use-user-profile";
import { useUserStore } from "@/store/useUserStore";
import { useActiveWorkoutStore } from "@/store/useActiveWorkoutStore";
import { FloatingWorkoutBar } from "@/components/workouts/FloatingWorkoutBar";
import ActiveWorkoutSession from "@/components/workouts/ActiveWorkoutSession/ActiveWorkoutSession";

const LEFT_TABS = [
  { id: "/student/diary", label: "Дневник", icon: Utensils },
  { id: "/student", label: "Трекер", icon: Activity },
];

const RIGHT_TABS = [
  { id: "/student/workouts", label: "Тренировки", icon: Dumbbell },
  { id: "/student/settings", label: "Профиль", icon: User },
];

export default function StudentTabsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const {
    pathname,
    selectedDate,
    dashState,
    dashActions,
    isActivityModalOpen,
    closeActivityModal,
    isConstructorOpen,
    activeMealType,
    isWaterDisabled,
    isPending,
    isMenuOpen,
    setIsMenuOpen,
    menuRef,
    handleProgrammaticClose,
    handleAddMeal,
    handleAddActivity,
    handleFastWaterAdd,
  } = useTabsLayoutLogic();

  const userId = useUserStore((state) => state.user?.id);
  const { data: profile } = useUserProfile(userId);

  const userWeight = Number(profile?.weight) || 70;
  const userGender = (profile?.gender as "male" | "female") || "female";

  // Подключаем глобальный стор активной тренировки
  const { isWorkoutActive, isMinimized } = useActiveWorkoutStore();

  const isFullWorkoutOpen = isWorkoutActive && !isMinimized;

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <main
        className={
          isConstructorOpen
            ? "pb-6"
            : "pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-24"
        }
      >
        {children}
      </main>

      {/* ПОЛНОЭКРАННЫЙ ОВЕРЛЕЙ АКТИВНОЙ ТРЕНИРОВКИ (РАБОТАЕТ ПОВЕРХ ЛЮБОЙ ВКЛАДКИ) */}
      <AnimatePresence>
        {isFullWorkoutOpen && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 250 }}
            className="fixed inset-0 bg-slate-50 z-50 overflow-y-auto pt-4 sm:pt-8 rounded-t-[32px] shadow-2xl"
          >
            <div className="max-w-4xl mx-auto w-full p-4 sm:p-6 md:p-8">
              <ActiveWorkoutSession userWeight={userWeight} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ПЛАВАЮЩАЯ ПЛАШКА СВЁРНУТОЙ ТРЕНИРОВКИ */}
      {!isConstructorOpen && <FloatingWorkoutBar />}

      {activeMealType && (
        <div className="fixed inset-0 bg-slate-50 z-50 overflow-y-auto animate-in fade-in slide-in-from-bottom-8 duration-300">
          <div className="max-w-6xl mx-auto p-4 md:p-8 pb-20">
            <FoodConstructor
              serverToday={selectedDate}
              onClose={handleProgrammaticClose}
            />
          </div>
        </div>
      )}

      <ActivityModal
        isOpen={isActivityModalOpen}
        onClose={closeActivityModal}
        formData={dashState.formData}
        setFormData={dashActions.setFormData}
        userWeight={userWeight}
        userGender={userGender}
        onSave={async (deletedWorkoutIds?: string[]) => {
          dashActions.handleSave(deletedWorkoutIds);
          closeActivityModal();
        }}
        isSaving={dashState.isSaving}
      />

      {isMenuOpen && (
        <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-md z-40 animate-in fade-in duration-200" />
      )}

      {!isConstructorOpen && !isFullWorkoutOpen && (
        <div
          ref={menuRef}
          className="fixed bottom-0 left-0 right-0 z-50 px-6 pb-[calc(1.2rem+env(safe-area-inset-bottom))] md:pb-6"
        >
          {isMenuOpen && (
            <StudentQuickMenu
              onAddMeal={handleAddMeal}
              onAddActivity={handleAddActivity}
              onFastWaterAdd={handleFastWaterAdd}
              isWaterDisabled={isWaterDisabled}
              isPending={isPending}
            />
          )}

          <StudentBottomBar
            pathname={pathname}
            leftTabs={LEFT_TABS}
            rightTabs={RIGHT_TABS}
            isMenuOpen={isMenuOpen}
            setIsMenuOpen={setIsMenuOpen}
          />
        </div>
      )}
    </div>
  );
}
