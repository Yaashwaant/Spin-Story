/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Disable turbopack for now to maintain compatibility
  turbopack: {},
  // Exclude Firebase Admin from client-side bundling
  serverExternalPackages: ["firebase-admin"],
  // Add webpack configuration to prevent Firebase Admin from being bundled for client
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Ensure Firebase Admin is not bundled for client-side
      config.resolve.fallback = {
        ...config.resolve.fallback,
        "firebase-admin": false,
        "firebase-admin/app": false,
        "firebase-admin/firestore": false,
        "firebase-admin/storage": false,
        "firebase-admin/auth": false,
        "fs": false,
        "path": false,
        "os": false,
        "crypto": false,
        "stream": false,
        "buffer": false,
        "util": false,
        "url": false,
        "net": false,
        "tls": false,
        "dns": false,
        "child_process": false,
        "cluster": false,
        "dgram": false,
        "readline": false,
        "repl": false,
        "vm": false,
        "module": false,
        "console": false,
        "timers": false,
        "process": false,
        "querystring": false,
        "http": false,
        "https": false,
        "zlib": false,
        "assert": false,
        "constants": false,
        "events": false,
        "punycode": false,
        "domain": false,
        "string_decoder": false,
        "sys": false,
        "tty": false,
        "v8": false,
        "inspector": false,
        "worker_threads": false,
      };
    }
    return config;
  },
}

export default nextConfig