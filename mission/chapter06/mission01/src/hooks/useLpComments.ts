import { useInfiniteQuery } from "@tanstack/react-query";
import { getComments } from "../apis/lp";

export const useLpComments = (lpId: number, order: "asc" | "desc") =>
  useInfiniteQuery({
    queryKey: ["lpComments", lpId, order],
    queryFn: ({ pageParam }) => getComments(lpId, pageParam, 10, order),
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasNext ? lastPage.nextCursor : undefined,
  });
