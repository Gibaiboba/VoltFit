import { useQuery } from "@tanstack/react-query";
import { coachService } from "@/services/coach.service";

export const useCoachQueries = () => {
  const studentsQuery = useQuery({
    queryKey: ["coach-students"],
    queryFn: () => coachService.getStudents(),
    // Данные считаются свежими 2 минуты, чтобы не дергать базу постоянно
    staleTime: 1000 * 60 * 2,
  });

  return { studentsQuery };
};
