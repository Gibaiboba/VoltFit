import { useMutation, useQueryClient } from "@tanstack/react-query";
import { coachService } from "@/services/coach.service";
import { toast } from "sonner";

export const useCoachMutations = () => {
  const queryClient = useQueryClient();

  // Мутация добавления (осталась без изменений)
  const addStudentMutation = useMutation({
    mutationFn: ({ email, coachId }: { email: string; coachId: string }) =>
      coachService.addStudentByEmail(email, coachId),
    onSuccess: (student) => {
      toast.success(`Ученик ${student.full_name} успешно добавлен`);
      queryClient.invalidateQueries({ queryKey: ["coach-students"] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // 👇 ДОБАВЛЯЕМ: Мутация удаления ученика
  const removeStudentMutation = useMutation({
    mutationFn: ({
      studentId,
      coachId,
    }: {
      studentId: string;
      coachId: string;
    }) => coachService.removeStudent(studentId, coachId),
    onSuccess: () => {
      toast.success("Сотрудничество с учеником прекращено");
      // Свежие данные автоматически подтянутся в список
      queryClient.invalidateQueries({ queryKey: ["coach-students"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Не удалось удалить ученика");
    },
  });

  return { addStudentMutation, removeStudentMutation };
};
