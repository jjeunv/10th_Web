import axiosInstance from "../lib/axios";
import type { ResponseSignupDto } from "../types/auth";

export const getMyInfo = async (): Promise<ResponseSignupDto> => {
  const response = await axiosInstance.get("/v1/users/me");
  return response.data.data;
};
