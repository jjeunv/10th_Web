import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createLp } from "../apis/lp";
import type { CreateLpDto } from "../types/lp";

export const useCreateLp = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateLpDto) => createLp(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lps"] });
    },
  });
};
