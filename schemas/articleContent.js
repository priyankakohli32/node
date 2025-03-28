import { z } from "zod";

export const getAllArticleContentsQuerySchema = z.object({
  search: z.string().optional(), // search with course title

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

export const createArticleContentSchema = z
  .object({
    article_id: z.number(),
    list_id: z.number().optional(),
    content_type: z.enum(["H2", "IMG", "OL", "P"]),
    content_text: z.string().optional(),
    image_url: z.string().optional(),
  })
  .refine(
    (data) =>
      data.content_type === "IMG" ? data.image_url !== undefined : true,
    {
      message: "image_url is required when content_type is IMG",
      path: ["image_url"],
    },
  )
  .refine(
    (data) =>
      data.content_type !== "IMG" ? data.content_text !== undefined : true,
    {
      message: "content_text is required when content_type is not IMG",
      path: ["content_text"],
    },
  )
  .refine(
    (data) => (data.content_type === "OL" ? data.list_id !== undefined : true),
    {
      message: "list_id is required when content_type is OL",
      path: ["list_id"],
    },
  );

export const updateArticleContentSchema = z
  .object({
    article_id: z.number().optional(),
    list_id: z.number().optional(),
    content_type: z.enum(["H2", "IMG", "OL", "P"]).optional(),
    content_text: z.string().optional(),
    image_url: z.string().optional(),
  })
  .refine(
    (data) =>
      data.content_type === "IMG" ? data.image_url !== undefined : true,
    {
      message: "image_url is required when content_type is IMG",
      path: ["image_url"],
    },
  )
  .refine(
    (data) =>
      data.content_type !== "IMG" ? data.content_text !== undefined : true,
    {
      message: "content_text is required when content_type is not IMG",
      path: ["content_text"],
    },
  )
  .refine(
    (data) => (data.content_type === "OL" ? data.list_id !== undefined : true),
    {
      message: "list_id is required when content_type is OL",
      path: ["list_id"],
    },
  );

export const swapArticleContentSchema = z.object({
  action: z.enum(["INCREMENT", "DECREMENT"]),
});
