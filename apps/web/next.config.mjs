/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@issue-tracker/shared"],
  webpack(config, { dev }) {
    if (dev) {
      config.watchOptions = {
        ...config.watchOptions,
        aggregateTimeout: 250,
        poll: 1000,
      };
    }

    return config;
  },
};

export default nextConfig;
