import z from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production"]),
  PORT: z.coerce.number().int(),
  ALPHABETS: z.string(),
  DB_URL: z.url(),
  REDIS_USERNAME: z.string(),
  REDIS_PASSWORD: z.string(),
  REDIS_HOST: z.string(),
});

const env = envSchema.parse(process.env);
export default env;
