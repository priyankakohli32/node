import { z } from "zod";

export const getAllLectureMCQsQuerySchema = z.object({
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

export const createLectureMCQsSchema = z.object({
  title: z.string(),
  lecture_id: z.number(),
  description: z.string(),
  marks: z.string(),
  mcq_type: z.enum(["single", "multiple"]),

  options: z.array(
    z.object({
      option: z.string(),
      reason: z.string(),
      is_correct: z.number(),
    }),
  ),
  correct_explanation: z.string(),
  wrong_explanation: z.string(),
});

export const updateLectureMCQsSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  marks: z.string().optional(),
  mcq_type: z.enum(["single", "multiple"]).optional(),

  options: z
    .array(
      z.object({
        option: z.string(),
        reason: z.string(),
        is_correct: z.number(),
      }),
    )
    .optional(),
  correct_explanation: z.string().optional(),
  wrong_explanation: z.string().optional(),
});
