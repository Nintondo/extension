import { context, build, BuildOptions, Plugin } from "esbuild";
import { copy } from "esbuild-plugin-copy";
import { sassPlugin, postcssModules } from "esbuild-sass-plugin";
import { nodeModulesPolyfillPlugin } from "esbuild-plugins-node-modules-polyfill";
import svgPlugin from "esbuild-svg";
const autoprefixer = require("autoprefixer");
const tailwindcss = require("tailwindcss");
import postcss from "postcss";

async function readJsonFile(path: string) {
  const file = Bun.file(path);
  return JSON.parse(await file.text());
}

const chrome = !Bun.argv.includes("--firefox");

const baseManifestPath = "./configs/manifests/base.json";
const chromeManifestPath = "./configs/manifests/chrome.json";
const firefoxManifestPath = "./configs/manifests/firefox.json";

const baseManifest = await readJsonFile(baseManifestPath);
const extraManifest = await readJsonFile(
  chrome ? chromeManifestPath : firefoxManifestPath
);

const isDev = Bun.argv.includes("--watch") || Bun.argv.includes("-w");

function mergeManifests(): Plugin {
  return {
    name: "merge-manifests",
    setup(build) {
      const content = {
        ...baseManifest,
        ...extraManifest,
        version: process.env.npm_package_version ?? "0.0.1",
      };
      if (Bun.argv.includes("--watch") && !Bun.argv.includes("--firefox")) {
        content.chrome_url_overrides = {
          newtab: "index.html",
        };
      }
      build.onEnd(() => {
        const path = build.initialOptions.outdir + "/manifest.json";
        Bun.write(path, JSON.stringify(content, undefined, 2)).catch((err) =>
          console.error(err)
        );
      });
    },
  };
}

console.log(
  `\n🔨 Building extension... \n` +
    `💻 Browser: ${chrome ? "Chrome" : "Firefox"}\n` +
    `💡 Version: ${process.env.npm_package_version}\n` +
    `♻️  Environment: ${isDev ? "Development" : "Production"}`
);

const buildOptions: BuildOptions = {
  entryPoints: {
    background: "src/background/index.ts",
    "content-script": "src/content-script/index.ts",
    pageProvider: "src/content-script/pageProvider/index.ts",
    ui: "src/ui/index.tsx",
  },
  outdir: chrome ? "dist/chrome" : "dist/firefox",
  minify: !isDev,
  bundle: true,
  logLevel: "info",
  define: {
    "import.meta.url": '""',
    "process.browser": "false",
  },
  target: ["es2016"],
  platform: "browser",
  plugins: [
    svgPlugin({
      typescript: true,
      svgo: true,
    }),
    sassPlugin({
      filter: /\.module\.scss$/,
      transform: postcssModules({}, [autoprefixer, tailwindcss]),
    }),
    sassPlugin({
      filter: /\.scss$/,
      async transform(source) {
        const { css } = await postcss([autoprefixer, tailwindcss]).process(
          source,
          { from: undefined }
        );
        return css;
      },
    }),
    copy({
      assets: {
        from: ["./configs/_raw/**/*"],
        to: ["."],
      },
    }),
    nodeModulesPolyfillPlugin({
      globals: {
        Buffer: true,
      },
      modules: {
        buffer: true,
        stream: true,
      },
    }),
    mergeManifests(),
  ],
};

if (isDev) {
  console.log("");
  const ctx = await context(buildOptions);
  await ctx.watch();
} else {
  await build(buildOptions);
}
