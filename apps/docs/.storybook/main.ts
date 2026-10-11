import type { StorybookConfig } from "@storybook/react-vite";
import { fileURLToPath } from "node:url";
import remarkGfm from "remark-gfm";

// Storybook lit directement les sources de @acme/ui : pas besoin de build, rechargement instantané.
const uiSrc = (p: string) => fileURLToPath(new URL(`../../../packages/ui/src/${p}`, import.meta.url));

const config: StorybookConfig = {
  stories: ["../stories/**/*.mdx", "../stories/**/*.stories.@(ts|tsx)"],
  addons: [
    // Docs déclaré à part pour activer le Markdown étendu (tableaux) dans les pages MDX.
    { name: "@storybook/addon-essentials", options: { docs: false } },
    {
      name: "@storybook/addon-docs",
      options: { mdxPluginOptions: { mdxCompileOptions: { remarkPlugins: [remarkGfm] } } },
    },
    "@storybook/addon-a11y",
  ],
  framework: { name: "@storybook/react-vite", options: {} },
  viteFinal: async (cfg) => {
    cfg.resolve ??= {};
    cfg.resolve.alias = [
      { find: /^@acme\/ui\/styles\.css$/, replacement: uiSrc("styles.css") },
      { find: /^@acme\/ui$/, replacement: uiSrc("index.ts") },
      ...(Array.isArray(cfg.resolve.alias) ? cfg.resolve.alias : []),
    ];
    return cfg;
  },
};
export default config;
