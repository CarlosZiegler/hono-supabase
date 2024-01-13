import { supabase } from "@/libs/supabase/client";
import { zValidator } from "@/middlewares/zodValidator.middleware";

import { db } from "@/libs/database/db";
import { users } from "@/libs/database/schema";
import { Hono } from "hono";
import { getCookie, setCookie } from "hono/cookie";
import { HTTPException } from "hono/http-exception";
import { endTime, startTime } from "hono/timing";
import { z } from "zod";

const authRoutes = new Hono()
	.post(
		"/sign-up",
		zValidator(
			"json",
			z.object({
				email: z.string(),
				password: z.string().min(8),
			}),
		),
		async (c) => {
			const { email, password } = c.req.valid("json");

			const { data, error } = await supabase.auth.signUp({
				email,
				password,
			});

			if (error || !data?.user?.email) {
				console.log(error);
				throw new Error(error?.message || "Error while signing up", {
					cause: error,
				});
			}

			const dbUser = {
				id: data?.user.id,
				email: data?.user.email,
				createdAt: data?.user.created_at,
				updatedAt: data?.user.updated_at,
			};

			const user = await db.insert(users).values(dbUser).returning();

			return c.json(user);
		},
	)
	.post(
		"/sign-in",
		zValidator(
			"json",
			z.object({
				email: z.string(),
				password: z.string().min(8),
			}),
		),
		async (c) => {
			const { email, password } = c.req.valid("json");

			const { data, error } = await supabase.auth.signInWithPassword({ email, password });

			if (error) {
				console.error("Error while signing in", error);
				throw new HTTPException(401, { message: error.message });
			}

			setCookie(c, "access_token", data?.session.access_token, {
				...(data?.session.expires_at && { expires: new Date(data.session.expires_at) }),
				httpOnly: true,
				path: "/",
				secure: true,
			});

			setCookie(c, "refresh_token", data?.session.refresh_token, {
				...(data?.session.expires_at && { expires: new Date(data.session.expires_at) }),
				httpOnly: true,
				path: "/",
				secure: true,
			});

			return c.json(data.user);
		},
	)
	.post(
		"/sign-in-with-provider",
		zValidator(
			"json",
			z.object({
				provider: z.enum(["google", "apple"]),
				token: z.string().min(8),
				accessToken: z.string().optional(),
			}),
		),
		async (c) => {
			const { token, provider, accessToken } = c.req.valid("json");
			// start a new timer
			startTime(c, "supabase.auth.signInWithProvider");
			const { data, error } = await supabase.auth.signInWithIdToken({
				provider,
				token,
				access_token: accessToken,
			});
			// end the timer
			endTime(c, "supabase.auth.signInWithProvider");

			if (error) {
				console.error("Error while signing in with Provider ", error);
				throw new HTTPException(401, { message: error.message });
			}

			setCookie(c, "access_token", data?.session.access_token, {
				...(data?.session.expires_at && { expires: new Date(data.session.expires_at) }),
				httpOnly: true,
				path: "/",
				secure: true,
			});

			setCookie(c, "refresh_token", data?.session.refresh_token, {
				...(data?.session.expires_at && { expires: new Date(data.session.expires_at) }),
				httpOnly: true,
				path: "/",
				secure: true,
			});

			return c.json(data.user);
		},
	)
	.get("/refresh", async (c) => {
		const refresh_token = getCookie(c, "refresh_token");
		if (!refresh_token) {
			throw new HTTPException(403, { message: "No refresh token" });
		}

		const { data, error } = await supabase.auth.refreshSession({
			refresh_token,
		});

		if (error) {
			console.error("Error while refreshing token", error);
			throw new HTTPException(403, { message: error.message });
		}

		if (data?.session) {
			setCookie(c, "refresh_token", data.session.refresh_token, {
				...(data.session.expires_at && { expires: new Date(data.session.expires_at) }),
				// httpOnly: true,
				// path: "/",
				// secure: true,
			});
		}

		return c.json(data.user);
	});

export default authRoutes;
