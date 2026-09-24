// Compatibility entry point for the current seven-game browser gate.
process.argv.push('--browser-only');
await import('./verify-offline.mjs');
