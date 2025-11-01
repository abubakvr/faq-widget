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
        assetFileNames: (assetInfo) => {
          // Only include CSS, exclude other assets like SVG files
          if (assetInfo.name?.endsWith(".css")) {
            return "style.css";
          }
          // Exclude other assets (like vite.svg) from dist
          return "[name][extname]";
        },
      },
      plugins: [
        {
          name: "auto-inject-css",
          generateBundle(_, bundle) {
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
                  // Prepend minified CSS injection code
                  const cssInjection = `(function(){if(typeof document!=='undefined'){var s=document.getElementById('faq-chatbot-styles');if(!s){s=document.createElement('style');s.id='faq-chatbot-styles';s.textContent=${JSON.stringify(
                    cssContent
                  )};document.head.appendChild(s)}}})();`;
                  chunk.code = cssInjection + chunk.code;
                }
              });
            }
          },
        },
        {
          name: "exclude-assets",
          generateBundle(_, bundle) {
            // Remove vite.svg and other unnecessary assets from bundle
            Object.keys(bundle).forEach((key) => {
              // Exclude SVG files (except if needed, but we don't need any)
              if (key.endsWith(".svg") || key.includes("vite.svg")) {
                delete bundle[key];
              }
            });
          },
        },
      ],
    },
    cssCodeSplit: false,
    cssMinify: true,
    minify: "esbuild", // esbuild is fast and produces good minification
    sourcemap: false, // Disable sourcemaps to reduce size (enable only for debugging)
    target: "es2015", // Target modern browsers for smaller output
    // Optimize chunk size
    chunkSizeWarningLimit: 1000,
  },
});
