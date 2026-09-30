// Expo configures Metro for the npm-workspaces monorepo automatically (SDK 52+).
// One addition: the shared packages (packages/*) are TypeScript written with
// Node-style ".js" import suffixes ("./rng.js" -> rng.ts), which Metro does not
// map on its own. Try the ".ts" file first for relative imports from those packages.
const path = require("node:path");
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);
const packagesDir = path.resolve(__dirname, "..", "..", "packages") + path.sep;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName.startsWith(".") && moduleName.endsWith(".js") && context.originModulePath.startsWith(packagesDir)) {
    try {
      return context.resolveRequest(context, moduleName.slice(0, -3) + ".ts", platform);
    } catch {
      // Not a TypeScript source; fall through to the normal resolver.
    }
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
