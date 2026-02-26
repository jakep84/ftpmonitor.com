import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,

  // Prevent webpack from trying to bundle ssh2 native bindings (.node)
  serverExternalPackages: ["ssh2", "ssh2-sftp-client"],
};

export default nextConfig;
