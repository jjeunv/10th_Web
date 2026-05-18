import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateLp } from "../apis/lp";
import type { UpdateLpDto } from "../types/lp";

export const useUpdateLp = (lpId: number, onSuccess?: () => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateLpDto) => updateLp(lpId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lp", lpId] });
      queryClient.invalidateQueries({ queryKey: ["lps"] });
      onSuccess?.();
    },
  });
};
