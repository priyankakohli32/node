import { z } from "zod";

// Define the main query parameters schema
export const getAllUsersQuerySchema = z.object({
  usertype: z.enum(["mentor", "admin", "student"]),
  search: z.string().optional(), // search with user name and user email
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

export const getUserShortDetails = z.object({
  usertype: z.enum(["mentor", "admin", "student"]),
  search: z.string().optional(), // search with user name and user email
});

export const updateUserSchema = z.object({
  name: z.string().optional(),
  password: z.string().optional(),
  age: z.number().optional(),
  dob: z.string().optional(),
  country_code: z.string().optional(),
  phone: z.number().optional(),

  experties: z.string().optional(),
  experience: z.string().optional(),
  linked_in_link: z.string().optional(),
  twitter_link: z.string().optional(),
  instagram_link: z.string().optional(),
  about: z.string().optional(),
});
