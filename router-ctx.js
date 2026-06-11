// Regex derived from expo-router@56 _ctx.android.js/_ctx.ios.js
// (union of platform suffixes; same exclusions: *+api, +html, +middleware).
export const ctx = require.context(
  "./app",
  true,
  /^(?:\.\/)(?!(?:(?:(?:.*\+api)|(?:\+html)|(?:\+middleware)))\.[tj]sx?$).*(?:\.android|\.ios|\.web|\.native)?\.[tj]sx?$/,
  process.env.EXPO_ROUTER_IMPORT_MODE
);
