import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/requests.ts");

const nextConfig: NextConfig = {
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
        hostname: "bba.org.lb",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "lopbeirut.org",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "www.oea.org.lb",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "scontent.fkye2-1.fna.fbcdn.net",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "www.orlb.org",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default withNextIntl(nextConfig);
