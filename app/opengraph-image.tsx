import { ImageResponse } from "next/og";

export const alt = "ELVARO COLLECTION + — Chaussures premium";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%",
        background: "linear-gradient(135deg, #081326 0%, #14233b 55%, #081326 100%)",
        color: "#f9f3e9",
        fontFamily: "serif",
      }}
    >
      <div style={{ width: 920, height: 2, background: "#c9a45c", marginBottom: 86 }} />
      <div style={{ fontSize: 118, letterSpacing: 14, fontWeight: 700 }}>ELVARO</div>
      <div style={{ display: "flex", alignItems: "center", gap: 28, marginTop: 12 }}>
        <div style={{ width: 95, height: 2, background: "#c9a45c" }} />
        <div style={{ fontSize: 42, color: "#d8af6a", letterSpacing: 12, fontFamily: "sans-serif" }}>
          COLLECTION +
        </div>
        <div style={{ width: 95, height: 2, background: "#c9a45c" }} />
      </div>
      <div style={{ fontSize: 24, fontFamily: "sans-serif", letterSpacing: 3, marginTop: 52 }}>
        CHAUSSURES PREMIUM
      </div>
      <div style={{ width: 920, height: 2, background: "#c9a45c", marginTop: 86 }} />
    </div>,
    size,
  );
}
