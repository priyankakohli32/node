import { z } from "zod";

export const getAllLectureContentsQuerySchema = z.object({
  search: z.string().optional(), // search with course title
  deleted: z.enum(["all", "true", "false"]),

  page: z
    .string()
    .optional()
    .default("1")
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().min(1)),
  size: z
    .string()
    .optional()
    .default("10")
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().min(1).max(100)),
});

export const createLectureContentSchema = z.object({
  title: z.string(),
  preview_image: z.string(),
  content_link: z.string(),
  content_type: z.string(),
  content_size: z.string(),
  duration: z.string(),
  lecture_id: z.number(),
});

export const updateLectureContentSchema = z.object({
  title: z.string().optional(),
  preview_image: z.string().optional(),
  content_link: z.string().optional(),
  content_type: z.string().optional(),
  content_size: z.string().optional(),
  duration: z.string().optional(),
});

export const swapLectureContentSchema = z.object({
  action: z.enum(["INCREMENT", "DECREMENT"]),
});
