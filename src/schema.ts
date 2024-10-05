import { z } from "zod";

export const configSchema = z
	.object({
		destination: z
			.string()
			.regex(/^(?:\.[a-zA-Z0-9_\-\/]+\/)*[a-zA-Z0-9_\-]+\.md$/, {
				message: "Destination must be a valid markdown file name",
			}),
		excludes: z
			.array(
				z.string().regex(/^(?:\.[a-zA-Z0-9_\-\/]+\/)*[a-zA-Z0-9_\-]+\.bru$/, {
					message: "Excludes must be an array of valid bru files",
				}),
			)
			.optional(),
		header: z
			.string()
			.regex(/^(?:\.[a-zA-Z0-9_\-\/]+\/)*[a-zA-Z0-9_\-]+\.md$/, {
				message: "Header must be a valid markdown file name",
			})
			.optional(),
		logOptions: z.object({
			silent: z
				.boolean({
					message: "If included, silent must be either 'true' or 'false'",
				})
				.optional(),
			verbose: z
				.boolean({
					message: "If included, verbose must be either 'true' or 'false'",
				})
				.optional(),
		}),
		source: z
			.string()
			.regex(/^(\.{0,2}\/?([a-zA-Z0-9_\-]+\/)*[a-zA-Z0-9_\-]+\/?)$/, {
				message: "Source must be a valid folder name",
			}),
		tail: z
			.string()
			.regex(/^(?:\.[a-zA-Z0-9_\-\/]+\/)*[a-zA-Z0-9_\-]+\.md$/, {
				message: "Tail must be a valid markdown file name",
			})
			.optional(),
		test: z
			.boolean({
				message: "If included, test must be either 'true' or 'false'",
			})
			.optional(),
	})
	.strict({
		message: "Unsupported key(s) in configuration file",
	});
