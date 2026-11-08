import z from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().int().min(1024),
  ALPHABETS: z.string(),
});

const env = envSchema.parse(process.env);
export default env;
