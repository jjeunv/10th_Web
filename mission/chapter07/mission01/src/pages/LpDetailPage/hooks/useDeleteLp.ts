import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { deleteLp } from "../../../apis/lp";

export const useDeleteLp = (lpId: number) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: () => deleteLp(lpId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lps"] });
      navigate("/");
    },
    onError: (error) => {
      console.error("LP 삭제 실패:", error);
    },
  });
};
