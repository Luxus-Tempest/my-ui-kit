import { ImageResponse } from "next/og";
import { siteConfig } from "@/config/site";

export const alt = siteConfig.name;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Image de partage (réseaux sociaux, messageries), générée depuis la config du site. */
export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: 96,
        gap: 28,
        background: "linear-gradient(140deg, #f6f8fc 0%, #d3e3fd 100%)",
        color: "#1f1f1f",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", width: 88, height: 88, borderRadius: 24, background: "#0b57d0" }} />
      <div style={{ fontSize: 76, fontWeight: 700, letterSpacing: -2 }}>{siteConfig.name}</div>
      <div style={{ fontSize: 34, color: "#444746", maxWidth: 900, lineHeight: 1.3 }}>{siteConfig.description}</div>
    </div>,
    size,
  );
}
