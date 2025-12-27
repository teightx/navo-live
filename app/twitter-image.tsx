import { ImageResponse } from "next/og";

// Route segment config
export const runtime = "edge";

// Image metadata
export const alt = "navo - acompanhe preços de passagens";
export const size = {
  width: 1200,
  height: 600,
};
export const contentType = "image/png";

// Image generation
export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#faf8f5",
          backgroundImage:
            "linear-gradient(180deg, #faf8f5 0%, #e8e4de 100%)",
        }}
      >
        {/* Background waves effect */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "180px",
            background:
              "linear-gradient(180deg, transparent 0%, rgba(127, 166, 179, 0.2) 100%)",
          }}
        />

        {/* Logo icon */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "24px",
          }}
        >
          <svg
            width="64"
            height="64"
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M8 32L24 8L40 32"
              stroke="#e8927c"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M16 32L24 16L32 32"
              stroke="#4f7386"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Brand name */}
        <div
          style={{
            fontSize: 64,
            fontWeight: 600,
            color: "#2d3748",
            letterSpacing: "-0.02em",
            marginBottom: "12px",
          }}
        >
          navo
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 28,
            color: "#666",
            letterSpacing: "0.01em",
          }}
        >
          acompanhe preços de passagens
        </div>

        {/* Domain */}
        <div
          style={{
            position: "absolute",
            bottom: "32px",
            fontSize: 18,
            color: "#4f7386",
          }}
        >
          navo.live
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}

