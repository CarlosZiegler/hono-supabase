import { supabase } from "@/libs/supabase/client";
import { type MiddlewareHandler } from "hono";
import { getCookie } from "hono/cookie";
import { HTTPException } from "hono/http-exception";

const authMiddleware: MiddlewareHandler = async (c, next) => {
	const refresh_token = getCookie(c, "refresh_token");
	const access_token = getCookie(c, "access_token");
	const { data, error } = await supabase.auth.getUser(access_token);

	if (data.user) {
		c.set("user", {
			id: data.user.id,
			email: data.user.email,
			created_at: data.user.created_at,
			updated_at: data.user.updated_at,
		});
	}
	//TODO: handle error properly
	if (error) {
		console.error("Error while getting user by access_token ", error);
		if (!refresh_token) {
			throw new HTTPException(403, { message: "No refresh token" });
		}

		const { data: refreshed, error: refreshError } = await supabase.auth.refreshSession({
			refresh_token,
		});

		if (refreshError) {
			console.error("Error while refreshing token", refreshError);
			throw new HTTPException(403, { message: " Error while refreshing token" });
		}

		if (refreshed.user) {
			c.set("user", {
				id: refreshed.user.id,
				email: refreshed.user.email,
				created_at: refreshed.user.created_at,
				updated_at: refreshed.user.updated_at,
			});
		}
	}

	await next();
};

export default authMiddleware;
