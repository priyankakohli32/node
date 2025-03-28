import { z } from "zod";

export const getAllCourseReferencesQuerySchema = z.object({
  search: z.string().optional(), // search with reference name
  deleted: z.enum(["all", "true", "false"]),

  course_id: z.string().optional(), // filter by course id

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

export const createCourseReferenceSchema = z.object({
  reference: z.string(),
  reference_type: z.string(),
  course_id: z.number(),
});

export const updateCourseReferenceSchema = z.object({
  reference: z.string().optional(),
  reference_type: z.string().optional(),
  course_id: z.number().optional(),
});
