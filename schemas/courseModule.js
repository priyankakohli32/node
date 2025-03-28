import { z } from "zod";

export const getAllCourseModulesQuerySchema = z.object({
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

export const createCourseModuleSchema = z.object({
  title: z.string(),
  description: z.string(),
  thumbnail: z.string(),
  course_id: z.number(),
  module_tags: z.array(
    z.object({
      lable: z.string(),
    }),
  ),
});

export const updateCourseModuleSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  thumbnail: z.string().optional(),
  course_id: z.number().optional(),
  module_tags: z
    .array(
      z.object({
        lable: z.string(),
      }),
    )
    .optional(),
});

export const swapCourseModuleSchema = z.object({
  action: z.enum(["INCREMENT", "DECREMENT"]),
});
