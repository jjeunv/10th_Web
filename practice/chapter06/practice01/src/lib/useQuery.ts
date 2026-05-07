import { useEffect, useState } from "react";
import { useQueryClient } from "./QueryClientProvider";

export const useQuery = ({
  queryKey,
  queryFn,
  staleTime = 0,
  gcTime = 5 * 1000 * 60,
  enabled = true,
}) => {
  const client = useQueryClient();

  const [state, setState] = useState(() => {
    if (!enabled)
      return { data: undefined, status: "pending", isFetching: false };
    if (client.hasQuery(queryKey) && !client.isStale(queryKey, staleTime)) {
      // 캐시가 있고 fresh하면 캐시 반환
      return {
        data: client.getQueryData(queryKey),
        status: "success",
        isFetching: false,
      };
    }
    return { data: undefined, status: "pending", isFetching: false };
  });

  useEffect(() => {
    if (!enabled) return; // enabled false면 리턴

    client.cancelGC(queryKey); // 재마운트 -> GC 취소하기

    const refetch = () => {
      setState((prev) => ({ ...prev, isFetching: true }));
      queryFn()
        .then((data: unknown) => {
          client.setQueryData(queryKey, data);
          setState({ data, status: "success", isFetching: false });
        })
        .catch(() => {
          setState({ data: undefined, status: "error", isFetching: false });
        });
    };

    client.subscribe(queryKey, refetch); // 구독 등록

    if (state.status === "success") {
      // 캐시에서 바로 가져온 경우 cleanup만 등록하기
      return () => {
        client.unsubscribe(queryKey, refetch);
        client.scheduleGC(queryKey, gcTime);
      };
    }

    refetch(); // 첫 패치

    return () => {
      client.unsubscribe(queryKey, refetch);
      client.scheduleGC(queryKey, gcTime);
    };
  }, [enabled]);

  return {
    data: state.data,
    status: state.status,
    isFetching: state.isFetching,
    isPending: state.status === "pending",
    isLoading: state.status === "pending" && state.isFetching,
    isError: state.status === "error",
    isSuccess: state.status === "success",
  };
};
