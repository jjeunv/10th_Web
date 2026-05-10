import axiosInstance from "../lib/axios";
import type { LpListResponseDto, LpResponseDto } from "../types/lp";

export const getLps = async (
  cursor?: number,
  limit?: number,
  search?: string,
  order?: "asc" | "desc",
): Promise<LpListResponseDto> => {
  const response = await axiosInstance.get("/v1/lps", {
    params: {
      cursor,
      limit,
      search,
      order,
    },
  });
  return response.data.data;
};

export const getLp = async (lpId: number): Promise<LpResponseDto> => {
  const response = await axiosInstance.get(`/v1/lps/${lpId}`);
  return response.data.data;
};
