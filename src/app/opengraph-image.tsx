import { ImageResponse } from "next/og";

export const alt = "AC Worship — La musique qui nous rassemble";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          padding: "80px",
          color: "#f3f1e8",
          background: "linear-gradient(135deg, #11140f 0%, #20251a 58%, #353b24 100%)",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
            <div
              style={{
                width: 76,
                height: 76,
                borderRadius: 22,
                background: "#171815",
                border: "1px solid #50533f",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
              }}
            >
              <div style={{ width: 8, height: 26, borderRadius: 8, background: "#aeb78a" }} />
              <div style={{ width: 8, height: 42, borderRadius: 8, background: "#d4dda9" }} />
              <div style={{ width: 8, height: 34, borderRadius: 8, background: "#c4ce98" }} />
            </div>
            <div style={{ fontSize: 34, fontWeight: 700, letterSpacing: 1 }}>AC WORSHIP</div>
          </div>
          <div style={{ fontSize: 70, fontWeight: 700, lineHeight: 1.05, maxWidth: 920 }}>
            La musique qui nous rassemble
          </div>
          <div style={{ fontSize: 28, color: "#c4c7b7" }}>
            Artistes · chants · nouvelles sorties
          </div>
        </div>
        <div
          style={{
            position: "absolute",
            right: -100,
            bottom: -240,
            width: 560,
            height: 560,
            borderRadius: 280,
            border: "1px solid rgba(212,221,169,.18)",
          }}
        />
      </div>
    ),
    size,
  );
}
