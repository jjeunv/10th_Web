import type { ResponseSignupDto } from "./auth";

export type TagResponseDto = {
  id: number;
  name: string;
};

export type LikeResponseDto = {
  id: number;
  userId: number;
  lpId: number;
};

export type LpResponseDto = {
  id: number;
  title: string;
  content: string;
  thumbnail: string | null;
  published: boolean;
  authorId: number;
  createdAt: string;
  updatedAt: string;
  tags: TagResponseDto[];
  likes: LikeResponseDto[];
  author: ResponseSignupDto;
};

export type LpListResponseDto = {
  data: LpResponseDto[];
  nextCursor: number;
  hasNext: boolean;
};
