import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Log, MutationContext } from "./types";
import { toast } from "sonner";

export const useDashboardMutations = (
  userId: string,
  onSuccessCb: () => void,
) => {
  const queryClient = useQueryClient();

  const saveMutation = useMutation<void, Error, Partial<Log>, MutationContext>({
    mutationFn: async (logData) => {
      const { error } = await supabase
        .from("daily_logs")
        .upsert(
          { user_id: userId, ...logData },
          { onConflict: "user_id,log_date" },
        );
      if (error) throw error;
    },
    onMutate: async (newLogData) => {
      await queryClient.cancelQueries({ queryKey: ["student-logs", userId] });
      const previousLogs = queryClient.getQueryData<Log[]>([
        "student-logs",
        userId,
      ]);

      queryClient.setQueryData<Log[]>(["student-logs", userId], (old = []) => {
        const exists = old.some((l) => l.log_date === newLogData.log_date);
        if (exists) {
          return old.map((l) =>
            l.log_date === newLogData.log_date ? { ...l, ...newLogData } : l,
          );
        }
        return [newLogData as Log, ...old].sort(
          (a, b) =>
            new Date(b.log_date).getTime() - new Date(a.log_date).getTime(),
        );
      });

      return { previousLogs };
    },
    onSuccess: () => {
      onSuccessCb(); // Очистка ввода в основном хуке
      toast.success("Данные успешно сохранены ✨");
    },
    onError: (err, _newLog, context) => {
      if (context?.previousLogs) {
        queryClient.setQueryData(
          ["student-logs", userId],
          context.previousLogs,
        );
      }
      toast.error("Не удалось сохранить данные");
      console.error(err);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["student-logs", userId] });
    },
  });

  return { saveMutation };
};
