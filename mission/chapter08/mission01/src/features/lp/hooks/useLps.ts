import { keepPreviousData, useInfiniteQuery } from "@tanstack/react-query";
import { getLps } from "../api/lp";

export const useLps = (order: "asc" | "desc") =>
  useInfiniteQuery({
    queryKey: ["lps", order],
    queryFn: ({ pageParam }) => getLps(pageParam, 10, undefined, order),
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasNext ? lastPage.nextCursor : undefined,
  });

export const useSearchLps = (order: "asc" | "desc", search: string) =>
  useInfiniteQuery({
    queryKey: ["lps", order, search],
    queryFn: ({ pageParam }) => getLps(pageParam, 10, search, order),
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasNext ? lastPage.nextCursor : undefined,
    enabled: !!search,
    staleTime: 1000 * 60 * 5,
    placeholderData: keepPreviousData,
  });
