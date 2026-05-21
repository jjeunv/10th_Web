import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateMyInfo } from "../../../apis/user";
import type { ResponseSignupDto } from "../../../types/auth";
import { useAuth } from "../../../contexts/AuthContext";

export const useUpdateMyInfo = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  const { updateName } = useAuth();

  return useMutation({
    mutationFn: updateMyInfo,
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ["myInfo"] });

      const previousMyInfo = queryClient.getQueryData<ResponseSignupDto>([
        "myInfo",
      ]);

      queryClient.setQueryData<ResponseSignupDto>(["myInfo"], (old) => {
        if (!old) return old;
        return {
          ...old,
          name: variables.name ?? old.name,
          bio: variables.bio !== undefined ? variables.bio : old.bio,
        };
      });

      const previousName = previousMyInfo?.name;

      if (variables.name) {
        updateName(variables.name);
      }

      return { previousMyInfo, previousName };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousMyInfo) {
        queryClient.setQueryData(["myInfo"], context.previousMyInfo);
      }
      if (context?.previousName !== undefined) {
        updateName(context.previousName);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["myInfo"] });
      onSuccess?.();
    },
  });
};
