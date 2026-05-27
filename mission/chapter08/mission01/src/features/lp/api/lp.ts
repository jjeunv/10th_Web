import axiosInstance from "../../../shared/lib/axios";
import type {
  CommentListResponseDto,
  LpListResponseDto,
  LpResponseDto,
  CreateLpDto,
  UpdateLpDto,
  CommentResponseDto,
} from "../types/lp";

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

export const getComments = async (
  lpId: number,
  cursor?: number,
  limit?: number,
  order?: "asc" | "desc",
): Promise<CommentListResponseDto> => {
  const response = await axiosInstance.get(`/v1/lps/${lpId}/comments`, {
    params: { cursor, limit, order },
  });
  return response.data.data;
};

export const createLp = async (data: CreateLpDto): Promise<LpResponseDto> => {
  const response = await axiosInstance.post("/v1/lps", data);
  return response.data.data;
};

export const updateLp = async (lpId: number, data: UpdateLpDto): Promise<LpResponseDto> => {
  const response = await axiosInstance.patch(`/v1/lps/${lpId}`, data);
  return response.data.data;
};

export const deleteLp = async (lpId: number): Promise<void> => {
  await axiosInstance.delete(`/v1/lps/${lpId}`);
};

export const createComment = async (
  lpId: number,
  content: string,
): Promise<CommentResponseDto> => {
  const response = await axiosInstance.post(`/v1/lps/${lpId}/comments`, {
    content,
  });
  return response.data.data;
};

export const updateComment = async (
  lpId: number,
  commentId: number,
  content: string,
): Promise<CommentResponseDto> => {
  const response = await axiosInstance.patch(
    `/v1/lps/${lpId}/comments/${commentId}`,
    { content },
  );
  return response.data.data;
};

export const deleteComment = async (
  lpId: number,
  commentId: number,
): Promise<{ message: string }> => {
  const response = await axiosInstance.delete(
    `/v1/lps/${lpId}/comments/${commentId}`,
  );
  return response.data.data;
};

export const toggleLike = async (lpId: number): Promise<void> => {
  await axiosInstance.post(`/v1/lps/${lpId}/likes`);
};
