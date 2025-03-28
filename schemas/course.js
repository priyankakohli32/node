import { z } from "zod";

export const getAllCoursesQuerySchema = z.object({
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

export const createCourseSchema = z.object({
  name: z.string(),
  description: z.string(),
  cost: z.string(),
  intro_video: z.string(),
  mentor_id: z.number(),
});

export const updateCourseSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  cost: z.string().optional(),
  intro_video: z.string().optional(),
  mentor_id: z.number().optional(),
});

export const swapCourseSchema = z.object({
  action: z.enum(["INCREMENT", "DECREMENT"]),
});
