import { z } from "zod";

export const LoginData = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const updatePasswordData = z.object({
  password: z.string(),
});

export const resetPasswordData = z.object({
  email: z.string().email(),
});

export const SignUpData = z.object({
  email: z.string().email(),
  password: z.string(),
  name: z.string(),
  age: z.number(),
  dob: z.string(),
  country_code: z.string(),
  phone: z.number(),

  experties: z.string().optional(),
  experience: z.string().optional(),
  linked_in_link: z.string().optional(),
  twitter_link: z.string().optional(),
  instagram_link: z.string().optional(),
  about: z.string().optional(),
});
