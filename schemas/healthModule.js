import { z } from "zod";

export const getAllHealthModulesQuerySchema = z.object({
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

export const createHealthModuleSchema = z.object({
  title: z.string(),
  preview_image: z.string(),
  time: z.string(),
  about: z.string(),
  video: z.string(),
  // mentor_id: z.number(),
});

export const updateHealthModuleSchema = z.object({
  title: z.string().optional(),
  preview_image: z.string().optional(),
  time: z.string().optional(),
  video: z.string().optional(),
  // mentor_id: z.number().optional(),
});
