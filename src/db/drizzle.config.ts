import { defineConfig } from "drizzle-kit"
import env from "../lib/env.js"

export default defineConfig({
    out: "./drizzle",
    dialect: "postgresql",
    schema: "./src/db/schema.ts",
    dbCredentials: {
        url: env.DB_URL
    }
})