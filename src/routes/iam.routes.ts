import authMiddleware from "@/middlewares/auth.middleware";
import { Hono } from "hono";

type Variables = {
	user: {
		id: string;
		email: string;
		created_at: string;
		updated_at: string;
	};
};

const iamRoutes = new Hono<{ Variables: Variables }>()
	.get("/test", async (c) => {
		const user = {
			id: "1",
			email: "test@gmail.com",
		};

		return c.json(user);
	})
	.use("*", authMiddleware)
	.get("/", async (c) => {
		const user = c.get("user");

		return c.json({ user, allUsers: 0 });
	});

export default iamRoutes;
