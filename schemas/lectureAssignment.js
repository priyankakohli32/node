import { z } from "zod";

export const getAllLectureAssignmentsQuerySchema = z.object({
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

export const createLectureAssignmentSchema = z.object({
  lecture_id: z.number(),
  title: z.string(),
  objective: z.string(),
  video_link: z.string(),
  marks: z.string(),
});

export const updateLectureAssignmentSchema = z.object({
  title: z.string().optional(),
  objective: z.string().optional(),
  video_link: z.string().optional(),
  marks: z.string().optional(),
});
