import { z } from "zod";

export const getAllArticlesQuerySchema = z.object({
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

export const createArticleSchema = z.object({
  title: z.string(),
  preview_image: z.string(),
  subtitle: z.string(),
  writer_name: z.string(),
  articleLink: z.string(),
});

export const updateArticleSchema = z.object({
  title: z.string().optional(),
  preview_image: z.string().optional(),
  subtitle: z.string().optional(),
  writer_name: z.string().optional(),
  articleLink: z.string().optional(),
});
