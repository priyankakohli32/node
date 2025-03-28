import { z } from "zod";

export const getAllLectureAssignmentSACLQsQuerySchema = z.object({
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

export const createLectureAssignmentSACLQsSchema = z.object({
  assignment_id: z.number(),
  type: z.string(),
});

export const updateLectureAssignmentSACLQsSchema = z.object({
  type: z.string().optional(),
});

export const swapLectureAssignmentSACLQsSchema = z.object({
  action: z.enum(["INCREMENT", "DECREMENT"]),
});

