/** @type {import('next').NextConfig} */
const crypto = require('crypto');
const path = require('path');

const nextConfig = {
  reactStrictMode: true,
  generateBuildId: async () => {
    // Generate a build ID using crypto.randomUUID if available
    // This works around a Next.js bug where nanoid fallback doesn't work correctly
    if (crypto && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    // Fallback: generate a random string similar to nanoid
    const chars = 'useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict';
    let result = '';
    const randomBytes = crypto.randomBytes(21);
    for (let i = 0; i < 21; i++) {
      result += chars[randomBytes[i] % 64];
    }
    return result;
  },
  webpack: (config, { isServer }) => {
    if (!config.resolve.alias) {
      config.resolve.alias = {};
    }
    config.resolve.alias['@'] = path.resolve(__dirname);
    return config;
  },
}

module.exports = nextConfig

