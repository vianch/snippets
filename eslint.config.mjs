import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import nextConfig from "eslint-config-next/core-web-vitals";
import eslintConfigPrettier from "eslint-config-prettier";
import prettierPlugin from "eslint-plugin-prettier";

export default tseslint.config(
	{
		ignores: [
			".next/",
			"node_modules/",
			"dist/",
			"build/",
			"storybook-static/",
		],
	},
	eslint.configs.recommended,
	...tseslint.configs.recommended,
	...nextConfig,
	eslintConfigPrettier,
	{
		files: ["**/*.{ts,tsx}"],
		plugins: {
			prettier: prettierPlugin,
		},
		languageOptions: {
			parserOptions: {
				project: "./tsconfig.json",
			},
		},
		settings: {
			react: {
				version: "detect",
			},
		},
		rules: {
			"prettier/prettier": "error",
			"react-hooks/exhaustive-deps": "off",
			"react-hooks/set-state-in-effect": "off",
			"no-console": "error",
			"max-lines": [
				"warn",
				{ max: 600, skipBlankLines: true, skipComments: true },
			],
			"@next/next/no-img-element": "off",
			"@next/next/next-script-for-ga": "off",
			"@next/next/no-css-tags": "off",
			"@typescript-eslint/no-unused-vars": [
				"error",
				{
					argsIgnorePattern: "^_",
					varsIgnorePattern: "^_",
					caughtErrorsIgnorePattern: "^_",
				},
			],
			"react/react-in-jsx-scope": "off",
			"react/jsx-filename-extension": [1, { extensions: [".ts", ".tsx"] }],
			"padding-line-between-statements": [
				"error",
				{ blankLine: "always", prev: "block", next: "*" },
				{ blankLine: "always", prev: "*", next: "block-like" },
				{ blankLine: "always", prev: "block-like", next: "*" },
				{ blankLine: "always", prev: ["case", "default"], next: "*" },
				{ blankLine: "always", prev: "block-like", next: "block-like" },
				{ blankLine: "always", prev: "*", next: "return" },
				{ blankLine: "always", prev: "*", next: "if" },
				{ blankLine: "always", prev: "*", next: "for" },
				{
					blankLine: "always",
					prev: ["const", "let", "var"],
					next: "*",
				},
				{
					blankLine: "any",
					prev: ["const", "let", "var"],
					next: ["const", "let", "var"],
				},
				{ blankLine: "always", prev: "directive", next: "*" },
				{ blankLine: "any", prev: "directive", next: "directive" },
			],
			"lines-between-class-members": [
				"error",
				"always",
				{ exceptAfterSingleLine: true },
			],
		},
	}
);
