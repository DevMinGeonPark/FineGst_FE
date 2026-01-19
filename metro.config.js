const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Expo Router uses require.context for route discovery.
config.transformer.unstable_allowRequireContext = true;
// Work around watchman edge cases that can drop files from context scans.
config.resolver.useWatchman = false;
// Force Expo Router to use our project-root context module.
config.resolver.extraNodeModules = {
  ...(config.resolver.extraNodeModules || {}),
  "expo-router/_ctx": path.join(__dirname, "router-ctx"),
};

module.exports = config;
