import axiosInstance from "../lib/axios";
import type { ResponseSignupDto, UpdateUserDto } from "../types/auth";

export const getMyInfo = async (): Promise<ResponseSignupDto> => {
  const response = await axiosInstance.get("/v1/users/me");
  return response.data.data;
};

export const updateMyInfo = async (
  data: UpdateUserDto,
): Promise<ResponseSignupDto> => {
  const response = await axiosInstance.patch("/v1/users", data);
  return response.data.data;
};

export const deleteUser = async (): Promise<void> => {
  await axiosInstance.delete("/v1/users");
};
