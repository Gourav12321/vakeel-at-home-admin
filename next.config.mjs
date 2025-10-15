// next.config.js
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        port: "",
        pathname: "/**",
      },
    ],
  },

  webpack(config) {
    // Remove Next's default handling of .svg as files
    config.module.rules = config.module.rules.map((rule) => {
      if (rule.test?.test?.(".svg")) {
        return { ...rule, test: /\.(png|jpe?g|gif|webp|avif)$/i };
      }
      return rule;
    });

    // Add SVGR loader
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: ["@svgr/webpack"],
    });

    return config;
  },
};

export default nextConfig;
