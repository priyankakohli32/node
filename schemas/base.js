import { z } from "zod";
export const PreSignedUrlData = z.object({
  filename: z.string(),
  ContentType: z.string(),
});
