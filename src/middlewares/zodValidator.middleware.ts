import { HTTPException } from "hono/http-exception";
import { fromZodError } from "zod-validation-error";

import type { Context, Env, MiddlewareHandler, TypedResponse, ValidationTargets } from "hono";
import { validator } from "hono/validator";
import type { ZodError, ZodSchema, z } from "zod";

// biome-ignore lint/complexity/noBannedTypes: <explanation>
export type Hook<T, E extends Env, P extends string, O = {}> = (
	result: { success: true; data: T } | { success: false; error: ZodError; data: T },
	c: Context<E, P>,
	// biome-ignore lint/suspicious/noConfusingVoidType: <explanation>
) => Response | Promise<Response> | void | Promise<Response | void> | TypedResponse<O>;

type HasUndefined<T> = undefined extends T ? true : false;

export const zValidator = <
	T extends ZodSchema,
	Target extends keyof ValidationTargets,
	E extends Env,
	P extends string,
	I = z.input<T>,
	O = z.output<T>,
	V extends {
		in: HasUndefined<I> extends true ? { [K in Target]?: I } : { [K in Target]: I };
		out: { [K in Target]: O };
	} = {
		in: HasUndefined<I> extends true ? { [K in Target]?: I } : { [K in Target]: I };
		out: { [K in Target]: O };
	},
>(
	target: Target,
	schema: T,
	hook?: Hook<z.infer<T>, E, P>,
): MiddlewareHandler<E, P, V> =>
	validator(target, async (value, c) => {
		const result = await schema.safeParseAsync(value);

		if (hook) {
			const hookResult = hook({ data: value, ...result }, c);
			if (hookResult) {
				if (hookResult instanceof Response || hookResult instanceof Promise) {
					return hookResult;
				}
				if ("response" in hookResult) {
					return hookResult.response;
				}
			}
		}

		if (!result.success) {
			const validationError = fromZodError(result.error);

			return c.json(
				{
					message: validationError.message,
					errors: validationError.details,
				},
				400,
			);
		}

		const data = result.data as z.infer<T>;
		return data;
	});
