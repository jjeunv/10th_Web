import axiosInstance from "../lib/axios";
import type {
  RequestLoginDto,
  RequestSignupDto,
  ResponseLoginDto,
  ResponseSignupDto,
} from "../types/auth";

export const signup = async (
  data: RequestSignupDto,
): Promise<ResponseSignupDto> => {
  const response = await axiosInstance.post("/v1/auth/signup", data);
  return response.data.data;
};

export const login = async (
  data: RequestLoginDto,
): Promise<ResponseLoginDto> => {
  const response = await axiosInstance.post("/v1/auth/signin", data);
  return response.data.data;
};
