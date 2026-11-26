import { z } from "zod";
export const env = z.object({
  MONGODB_URI: z.string().url().default("mongodb://form:form-local@127.0.0.1:27017/form?authSource=admin"),
  GEMINI_API_KEY: z.string().min(1).optional(),
  GEMINI_MODEL: z.string().default("gemini-3.5-flash-lite"),
}).parse({
  MONGODB_URI: process.env.MONGODB_URI,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  GEMINI_MODEL: process.env.GEMINI_MODEL,
});
