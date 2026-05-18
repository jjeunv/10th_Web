import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toggleLike } from "../../../apis/lp";
import type { LpResponseDto, LikeResponseDto } from "../../../types/lp";
import { useAuth } from "../../../contexts/AuthContext";

export const useToggleLike = (lpId: number) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: () => toggleLike(lpId),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["lp", lpId] });

      const previousLp = queryClient.getQueryData<LpResponseDto>(["lp", lpId]);

      queryClient.setQueryData<LpResponseDto>(["lp", lpId], (old) => {
        if (!old || !user) return old;

        const isLiked = old.likes.some((like) => like.userId === user.id);

        if (isLiked) {
          return { ...old, likes: old.likes.filter((like) => like.userId !== user.id) };
        } else {
          const optimisticLike: LikeResponseDto = { id: -1, userId: user.id, lpId };
          return { ...old, likes: [...old.likes, optimisticLike] };
        }
      });

      return { previousLp };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousLp) {
        queryClient.setQueryData(["lp", lpId], context.previousLp);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["lp", lpId] });
    },
  });
};
