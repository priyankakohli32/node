import { z } from "zod";

export const getAllLectureAssignmentInstructionsQuerySchema = z.object({
  search: z.string().optional(), // search with course title
  assignment_id: z.string(),
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

export const createLectureAssignmentInstructionSchema = z.object({
  assignment_id: z.number(),
  title: z.string(),
  description: z.string(),
});

export const updateLectureAssignmentInstructionSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
});


export const swapLectureAssignmentInstructionSchema = z.object({
  action: z.enum(["INCREMENT", "DECREMENT"]),
});
