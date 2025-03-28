import { z } from "zod";

export const getAllLectureReferencesQuerySchema = z.object({
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

export const createLectureReferenceSchema = z.object({
  title: z.string(),
  reference: z.string(),
  reference_type: z.string(),
  lecture_id: z.number(),
});

export const updateLectureReferenceSchema = z.object({
  title: z.string(),
  reference: z.string(),
  reference_type: z.string(),
});
