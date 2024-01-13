import { type ErrorHandler } from "hono";
import { HTTPException } from "hono/http-exception";

const errorHandler: ErrorHandler = (err, c) => {
	console.error(`Error on ${c.req.method} ${c.req.url}`);
	console.error(err?.message);
	console.error(err?.stack);
	if (err instanceof HTTPException) {
		return err.getResponse();
	}

	return new Response("Internal Error", {
		status: 500,
		statusText: err?.message || "Internal Error",
	});
};

export default errorHandler;
