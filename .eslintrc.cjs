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
	],
	rules: {
		"@typescript-eslint/no-unused-vars": "warn",
		"@typescript-eslint/consistent-type-imports": "warn",

		"@stylistic/indent": ["warn", "tab"],
		"@stylistic/no-tabs": ["warn", { allowIndentationTabs: true }],
		"@stylistic/quotes": ["warn", "double"],
		"@stylistic/comma-dangle": ["warn", "always-multiline"],
		"@stylistic/semi": ["warn", "always"],
		"@stylistic/member-delimiter-style": "warn",
		"@stylistic/eol-last": ["warn", "always"],
		"@stylistic/no-multiple-empty-lines": ["warn", { max: 2, maxEOF: 1, maxBOF: 0 }],
		"@stylistic/padded-blocks": ["warn", "never"],
		"@stylistic/quote-props": ["warn", "consistent-as-needed"],

		"import/newline-after-import": "warn",
		"import/no-duplicates": "warn",
		"import/order": ["warn", {
			"groups": ["builtin", "external", "parent", "sibling", "index", "type"],
			"alphabetize": { order: "asc", orderImportKind: "asc" },
			"newlines-between": "never",
		}],
	},
};
