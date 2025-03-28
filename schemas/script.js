import { z } from "zod";

export const getAllScriptsQuerySchema = z.object({
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

export const createScriptSchema = z.object({
  title: z.string(),
  no_of_characters: z.number(),
  written_by: z.string(),
  synopsis: z.string(),
  performance_notes: z.string(),
  script_text: z.string(),
  script_type: z.string(),
});

export const updateScriptSchema = z.object({
  title: z.string().optional(),
  no_of_characters: z.number().optional(),
  written_by: z.string().optional(),
  synopsis: z.string().optional(),
  performance_notes: z.string().optional(),
  script_text: z.string().optional(),
  script_type: z.string().optional(),
});
