import { useQuery } from "@tanstack/react-query";
import { getLp } from "../api/lp";

export const useLp = (lpId: number) =>
  useQuery({
    queryKey: ["lp", lpId],
    queryFn: () => getLp(lpId),
  });
