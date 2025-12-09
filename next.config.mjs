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

  // Add rewrites to proxy API requests and avoid CORS
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: "http://localhost:5970/api/v1/:path*",
      },
    ];
  },

  // Add headers to handle CORS
  async headers() {
    return [
      {
        source: "/api/v1/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, PUT, DELETE, OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, Authorization",
          },
        ],
      },
    ];
  },

  // Turbopack configuration (empty for now, but required to silence the error)
  turbopack: {},

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
