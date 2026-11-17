"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { coachService } from "@/services/coach.service";
import { useUserStore } from "@/store/useUserStore";
import { AssignedProgram, WorkoutTemplate } from "@/types/workout";

export function useCoachPrograms(studentId: string) {
  const queryClient = useQueryClient();
  const coachId = useUserStore((state) => state.user?.id);

  const { data: allPrograms = [], isLoading } = useQuery<AssignedProgram[]>({
    queryKey: ["coach-assigned-programs", studentId],
    queryFn: () => coachService.getStudentPrograms(studentId),
    enabled: !!studentId,
  });

  const activeProgram = allPrograms.find((p) => p.is_active) || null;
  const archivedPrograms = allPrograms.filter((p) => !p.is_active);

  const invalidatePrograms = () => {
    queryClient.invalidateQueries({
      queryKey: ["coach-assigned-programs", studentId],
    });
    queryClient.invalidateQueries({
      queryKey: ["assigned-program", studentId],
    });
  };

  const { mutateAsync: assignProgram, isPending: isSaving } = useMutation({
    mutationFn: async (params: {
      programName: string;
      coachNotes: string;
      workouts: WorkoutTemplate[];
    }) => {
      if (!coachId) throw new Error("Тренер не авторизован");
      const validWorkouts = params.workouts.filter(
        (w) => w.exercises.length > 0,
      );
      if (validWorkouts.length === 0) {
        throw new Error("Добавьте хотя бы одно упражнение в тренировку");
      }

      await coachService.assignProgramToStudent({
        studentId,
        coachId,
        programName: params.programName.trim() || "Программа от тренера",
        coachNotes: params.coachNotes.trim() || null,
        workouts: validWorkouts,
      });
    },
    onSuccess: () => {
      toast.success("Программа успешно назначена ученику! 🚀");
      invalidatePrograms();
    },
    onError: (err: Error) => {
      toast.error(err.message || "Не удалось назначить программу");
    },
  });

  const { mutate: toggleProgramStatus } = useMutation({
    mutationFn: ({
      programId,
      isActive,
    }: {
      programId: string;
      isActive: boolean;
    }) => coachService.setProgramActiveStatus(studentId, programId, isActive),
    onSuccess: (_, variables) => {
      toast.success(
        variables.isActive
          ? "Программа снова назначена активной! 🚀"
          : "Программа перенесена в архив",
      );
      invalidatePrograms();
    },
    onError: () => {
      toast.error("Не удалось изменить статус программы");
    },
  });

  return {
    activeProgram,
    archivedPrograms,
    isLoading,
    assignProgram,
    isSaving,
    toggleProgramStatus,
  };
}
