import tseslint from "typescript-eslint";

export default tseslint.config(
  // Expo's generated route types and its CommonJS Metro config are not ours to lint.
  { ignores: ["**/node_modules/**", "**/dist/**", "**/.expo/**", "apps/mobile/metro.config.js"] },
  ...tseslint.configs.recommended,
  {
    // The engine must be deterministic: no ambient randomness or clock.
    files: ["packages/engine/src/**/*.ts", "packages/fitness-model/src/**/*.ts", "packages/content/src/**/*.ts"],
    rules: {
      "no-restricted-properties": [
        "error",
        { object: "Math", property: "random", message: "Use the seeded Rng from rng.ts." },
        { object: "Date", property: "now", message: "Time must be passed in as input." },
      ],
      "no-restricted-globals": ["error", { name: "Date", message: "Time must be passed in as input (epoch days)." }],
    },
  },
);
