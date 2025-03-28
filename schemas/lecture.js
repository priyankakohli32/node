import { z } from "zod";

export const getAllLecturesQuerySchema = z.object({
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

export const createLectureSchema = z.object({
  title: z.string(),
  summary: z.string(),
  course_id: z.number(),
  course_module_id: z.number(),
  mentors: z.array(z.number()),
});

export const updateLectureSchema = z.object({
  title: z.string().optional(),
  summary: z.string().optional(),
  mentors: z.array(z.number()).optional(),
});

export const swapLectureSchema = z.object({
  action: z.enum(["INCREMENT", "DECREMENT"]),
});
