import z from "zod";

export const searchSchema = z.object({
  query: z.string().min(1, "검색어를 입력해주세요"),
  adult: z.boolean(),
  language: z.string(),
});

export type FormValues = z.infer<typeof searchSchema>;
