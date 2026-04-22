import { ImageResponse } from "next/og";

export const alt = "Terapia en Fácil — Terapeuta Ocupacional en Santiago, Chile";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          backgroundColor: "#D5D0F7",
          fontFamily: "sans-serif",
          padding: "72px 80px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative circle — top right */}
        <div
          style={{
            display: "flex",
            position: "absolute",
            top: -80,
            right: -80,
            width: 320,
            height: 320,
            borderRadius: "50%",
            backgroundColor: "#4361EE",
          }}
        />
        {/* Decorative circle — bottom left */}
        <div
          style={{
            display: "flex",
            position: "absolute",
            bottom: -60,
            left: -60,
            width: 220,
            height: 220,
            borderRadius: "50%",
            backgroundColor: "#2DC653",
          }}
        />
        {/* Orange half-circle — bottom right */}
        <div
          style={{
            display: "flex",
            position: "absolute",
            bottom: 50,
            right: 100,
            width: 140,
            height: 70,
            borderRadius: "70px 70px 0 0",
            backgroundColor: "#FF8C42",
          }}
        />
        {/* Pink dot */}
        <div
          style={{
            display: "flex",
            position: "absolute",
            top: 120,
            right: 220,
            width: 40,
            height: 40,
            borderRadius: "50%",
            backgroundColor: "#FF6B9D",
          }}
        />

        {/* Content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            position: "relative",
            zIndex: 1,
          }}
        >
          {/* Badge */}
          <div
            style={{
              display: "flex",
              alignSelf: "flex-start",
              backgroundColor: "#FFD43B",
              borderRadius: 50,
              padding: "10px 28px",
              marginBottom: 36,
              fontSize: 22,
              fontWeight: 700,
              color: "#1a1a2e",
            }}
          >
            Terapia Ocupacional · Santiago, Chile
          </div>

          {/* Main headline — two lines as separate divs (Satori doesn't support br) */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontSize: 80,
              fontWeight: 900,
              color: "#1a1a2e",
              lineHeight: 1.05,
              marginBottom: 28,
            }}
          >
            <div style={{ display: "flex" }}>Tu bienestar,</div>
            <div style={{ display: "flex" }}>mi compromiso</div>
          </div>

          {/* Subtitle */}
          <div
            style={{
              display: "flex",
              fontSize: 30,
              color: "#444444",
              fontWeight: 500,
              marginBottom: 44,
            }}
          >
            Bárbara Alarcón Villafaña · Terapeuta Ocupacional
          </div>

          {/* Service pills */}
          <div style={{ display: "flex", gap: 14 }}>
            {[
              "Atención Temprana",
              "Adaptación de Puesto",
              "Babysitting Terapéutico",
            ].map((s) => (
              <div
                key={s}
                style={{
                  display: "flex",
                  backgroundColor: "white",
                  borderRadius: 14,
                  padding: "10px 22px",
                  fontSize: 20,
                  fontWeight: 600,
                  color: "#1a1a2e",
                }}
              >
                {s}
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
