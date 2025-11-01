import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "FagAgentSDK",
      formats: ["es", "cjs"],
      fileName: (format) => `index.${format === "es" ? "mjs" : "cjs"}`,
    },
    rollupOptions: {
      external: ["react", "react-dom", "react/jsx-runtime"],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
          "react/jsx-runtime": "react/jsx-runtime",
        },
        exports: "named",
        assetFileNames: "style.css",
      },
      plugins: [
        {
          name: "auto-inject-css",
          generateBundle(options, bundle) {
            // After CSS is generated, read it and inject into JS bundle
            const cssFileName = Object.keys(bundle).find((f) =>
              f.endsWith(".css")
            );
            if (cssFileName && bundle[cssFileName].type === "asset") {
              const cssContent =
                typeof bundle[cssFileName].source === "string"
                  ? bundle[cssFileName].source
                  : bundle[cssFileName].source.toString();

              // Find the JS entry files and inject CSS loading code
              Object.keys(bundle).forEach((key) => {
                const chunk = bundle[key];
                if (
                  chunk.type === "chunk" &&
                  (key.endsWith(".mjs") || key.endsWith(".cjs"))
                ) {
                  // Prepend CSS injection code that runs immediately when module loads
                  const cssInjection = `(function() {
  if (typeof document !== 'undefined') {
    var style = document.getElementById('faq-chatbot-styles');
    if (!style) {
      style = document.createElement('style');
      style.id = 'faq-chatbot-styles';
      style.textContent = ${JSON.stringify(cssContent)};
      document.head.appendChild(style);
    }
  }
})();
`;
                  chunk.code = cssInjection + chunk.code;
                }
              });
            }
          },
        },
      ],
    },
    cssCodeSplit: false,
    sourcemap: true,
  },
});
