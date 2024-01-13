import "dotenv/config";
import { z } from "zod";

console.log("🔐 Loading environment variables...");

const serverSchema = z.object({
	// Node
	NODE_ENV: z.string(),
	// Database
	DATABASE_URL: z.string().min(1),

	// Supabase
	SUPABASE_URL: z.string().min(1),
	SUPABASE_SERVICE_ROLE: z.string().min(1),
	SENTRY_DSN: z.string().optional(),
});

const _serverEnv = serverSchema.safeParse(process.env);

if (!_serverEnv.success) {
	console.error("❌ Invalid environment variables:\n");
	_serverEnv.error.issues.forEach((issue) => {
		console.error(issue);
	});
	throw new Error("Invalid environment variables");
}

const { NODE_ENV, DATABASE_URL, SUPABASE_SERVICE_ROLE, SUPABASE_URL, SENTRY_DSN } = _serverEnv.data;

export const env = {
	NODE_ENV,
	DATABASE_URL,
	SUPABASE_SERVICE_ROLE,
	SUPABASE_URL,
	SENTRY_DSN,
};
console.log("✅ Environment variables loaded");
