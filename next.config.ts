import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  output: 'export',
  distDir: globalThis.process?.env['BUILD_OUTPUTS']==='true'?'./dist/packages/web/exported':undefined,

  images:{
    unoptimized:true,
  },

  devIndicators: false,
};

export default nextConfig;
