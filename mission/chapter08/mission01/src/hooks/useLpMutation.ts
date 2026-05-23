import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createLp, updateLp } from "../apis/lp";
import type { CreateLpDto, UpdateLpDto } from "../types/lp";

export const useLpMutation = (lpId?: number) => {
  const queryClient = useQueryClient();
  const isEditMode = !!lpId;

  return useMutation({
    mutationFn: (data: CreateLpDto | UpdateLpDto) =>
      isEditMode ? updateLp(lpId, data as UpdateLpDto) : createLp(data as CreateLpDto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lps"] });
      if (isEditMode) queryClient.invalidateQueries({ queryKey: ["lp", lpId] });
    },
  });
};
