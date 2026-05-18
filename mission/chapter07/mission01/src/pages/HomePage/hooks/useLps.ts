import { useInfiniteQuery } from "@tanstack/react-query";
import { getLps } from "../../../apis/lp";

export const useLps = (order: "asc" | "desc") =>
  useInfiniteQuery({
    queryKey: ["lps", order],
    queryFn: ({ pageParam }) => getLps(pageParam, 10, undefined, order),
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasNext ? lastPage.nextCursor : undefined,
  });
