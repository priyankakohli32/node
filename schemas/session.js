import { z } from "zod";

export const getAllSessionsQuerySchema = z.object({
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

export const createSessionSchema = z.object({
  time: z.string(),
  agendas: z.array(z.string()),
  availability: z.number(),
  cost: z.number(),
  is_paid: z.number(),
  title: z.string(),
  subtitle: z.string(),
  starttime: z.string(),
  endtime: z.string(),
  mentor: z.number().optional(),
});

export const updateSessionSchema = z.object({
  time: z.string().optional(),
  agendas: z.array(z.string()).optional(),
  availability: z.number().optional(),
  cost: z.number().optional(),
  is_paid: z.number().optional(),
  title: z.string().optional(),
  subtitle: z.string().optional(),
  starttime: z.string().optional(),
  endtime: z.string().optional(),
  mentor: z.number().optional(),
});
