import type { NextConfig } from "next";
  import createMDX from "@next/mdx";

  const withMDX = createMDX({ extension: /\.mdx?$/ });

  const nextConfig: NextConfig = {
    pageExtensions: ["ts", "tsx", "md", "mdx"],
    async redirects() {
      return [
        { source: "/what-is-kwikbio", destination: "/about", permanent: true },
      ];
    },
  };

  export default withMDX(nextConfig);
  