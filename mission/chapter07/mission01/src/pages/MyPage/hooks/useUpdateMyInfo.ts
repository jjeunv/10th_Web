import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateMyInfo } from "../../../apis/user";

export const useUpdateMyInfo = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateMyInfo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myInfo"] });
      onSuccess?.();
    },
  });
};
