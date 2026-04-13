import { useMutation, useQueryClient } from "@tanstack/react-query";
import { coachService } from "@/services/coach.service";
import { toast } from "sonner";

export const useCoachMutations = () => {
  const queryClient = useQueryClient();

  const addStudentMutation = useMutation({
    mutationFn: ({ email, coachId }: { email: string; coachId: string }) =>
      coachService.addStudentByEmail(email, coachId),
    onSuccess: (student) => {
      toast.success(`Ученик ${student.full_name} успешно добавлен`);
      // Инвалидируем кэш, чтобы список студентов обновился сам
      queryClient.invalidateQueries({ queryKey: ["coach-students"] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  return { addStudentMutation };
};
