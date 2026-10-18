import type { NextConfig } from "next";

/**
 * En têtes de sécurité de base, sur toutes les routes. La politique de sécurité du contenu (CSP)
 * dépend des services que ton application appelle (analytics, paiement, polices…) : ajoute la
 * ici, dans `headers`, quand tu les connais.
 */
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
