import { build } from "esbuild";
import type { BuildOptions } from "esbuild";

const options = {
	bundle: true,
	entryPoints: ["./src/server.ts"],
	banner: {
		js: "#!/usr/bin/env node",
	},
	platform: "node",
	outfile: "./dist/index.js",
	minify: true,
	format: "esm",
	logLevel: "info",
} satisfies BuildOptions;

const buildApp = async () => {
	try {
		await build(options);
	} catch (error) {
		console.log(error);
		process.exit(1);
	}
};

await buildApp();
