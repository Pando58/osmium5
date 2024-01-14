const stylistic = require("@stylistic/eslint-plugin");

module.exports = {
	root: true,
	extends: [
		"eslint:recommended",
		"plugin:@typescript-eslint/recommended",
		"plugin:svelte/recommended",
	],
	parser: "@typescript-eslint/parser",
	plugins: [
		"@typescript-eslint",
		"@stylistic",
		"import",
	],
	parserOptions: {
		sourceType: "module",
		ecmaVersion: 2020,
		extraFileExtensions: [".svelte"],
		project: ["./tsconfig.json"],
	},
	env: {
		browser: true,
		es2017: true,
		node: true,
	},
	overrides: [
		{
			files: ["*.svelte"],
			parser: "svelte-eslint-parser",
			parserOptions: {
				parser: "@typescript-eslint/parser",
			},
		},
		{
			files: [".eslintrc.cjs"],
			rules: {
				"@typescript-eslint/no-var-requires": "off",
			},
		},
		{
			files: ["*.test.ts"],
			rules: {
				"no-empty-pattern": ["warn", { allowObjectPatternsAsParameters: true }],
			},
		},
	],
	rules: {
		"@typescript-eslint/no-unused-vars": [
			"warn",
			{
				argsIgnorePattern: "^_",
				varsIgnorePattern: "^_",
				caughtErrorsIgnorePattern: "^_",
			},
		],
		"@typescript-eslint/consistent-type-imports": "warn",

		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		...Object.fromEntries(Object.entries(stylistic.configs.customize({
			indent: "tab",
			quotes: "double",
			semi: true,
			jsx: false,
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		}).rules).map(([k, v]) => [k, v === "error" ? "warn" : v[0] === "error" ? ["warn", ...v.slice(1)] : v])),
		"@stylistic/arrow-parens": ["warn", "as-needed", { requireForBlockBody: false }],
		"@stylistic/brace-style": "warn",
		"@stylistic/function-call-spacing": "warn",
		"@stylistic/member-delimiter-style": "warn", // Override 'none' default

		"svelte/indent": ["warn", { indent: "tab" }],
		"svelte/no-useless-mustaches": "warn",
		"svelte/first-attribute-linebreak": "warn",
		"svelte/html-closing-bracket-spacing": "warn",
		"svelte/html-quotes": "warn",
		"svelte/html-self-closing": "warn",
		"svelte/mustache-spacing": "warn",
		"svelte/no-spaces-around-equal-signs-in-attribute": "warn",
		"svelte/shorthand-attribute": "warn",
		"svelte/shorthand-directive": "warn",
		"svelte/spaced-html-comment": "warn",

		"import/newline-after-import": "warn",
		"import/no-duplicates": ["warn", { "prefer-inline": true }],
		"import/consistent-type-specifier-style": ["warn", "prefer-inline"],
		"import/order": ["warn", {
			"groups": ["builtin", "external", "parent", "sibling", "index", "type"],
			"alphabetize": { order: "asc", orderImportKind: "asc" },
			"newlines-between": "never",
		}],
	},
};
