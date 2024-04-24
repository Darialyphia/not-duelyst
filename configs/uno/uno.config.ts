// uno.config.ts
import {
  defineConfig,
  presetUno,
  transformerVariantGroup,
  presetIcons,
} from "unocss";
import fs from "fs";
import { presetOpenProps } from "./preset-open-props";
import * as csstree from "css-tree";

export const createUnoConfig = (options: {
  cssTheme: string;
  additional: string[];
}) => {
  const ast = csstree.parse(options.cssTheme);
  const themeColors: Record<string, string> = {};
  const colorIdentifierRE = new RegExp("--color-(.+)-hsl$");

  csstree.walk(ast, (node) => {
    if (node.type !== "Declaration") return;
    const { property } = node;
    const match = property.match(colorIdentifierRE);
    if (match?.[1]) {
      themeColors[match[1]] = `hsl(var(${property}) / <alpha-value>)`;
    }
  });

  return defineConfig({
    blocklist: ["container"],
    presets: [presetIcons(), presetUno(), presetOpenProps()],
    transformers: [transformerVariantGroup()],
    content: {
      filesystem: [
        "**/*.{html,js,ts,vue}",
        ...options.additional.map((path) => `${path}/**/*.{html,js,ts,vue}`),
      ],
    },
    theme: {
      colors: themeColors,
    },
  });
};
