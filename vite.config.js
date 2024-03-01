import { defineConfig } from "vite";
import { babel } from "@rollup/plugin-babel";

export default defineConfig({
  plugins: [
    babel({
      babelHelpers: "bundled",
      plugins: [
        "stylewars",
        [
          "htm",
          {
            import: "@dependable/view",
            useBuiltIns: true,
            useNativeSpread: true,
          },
        ],
      ],
    }),
  ],
});
