import { ImageResponse } from "next/og";

export const alt = "AI Events SG: Singapore AI community events calendar";
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
          flexDirection: "column",
          justifyContent: "center",
          padding: 72,
          background:
            "linear-gradient(155deg, oklch(0.12 0.03 252) 0%, oklch(0.17 0.04 248) 48%, oklch(0.14 0.025 252) 100%)",
          color: "oklch(0.95 0.01 250)",
          fontFamily:
            'ui-sans-serif, system-ui, "Segoe UI", Roboto, Helvetica, Arial',
        }}
      >
        <div
          style={{
            fontSize: 22,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "oklch(0.74 0.11 22)",
            fontWeight: 600,
            marginBottom: 20,
          }}
        >
          Singapore · Community
        </div>
        <div
          style={{
            fontSize: 64,
            fontWeight: 700,
            lineHeight: 1.05,
            letterSpacing: "-0.03em",
            maxWidth: 900,
          }}
        >
          AI Events SG
        </div>
        <div
          style={{
            marginTop: 28,
            fontSize: 28,
            lineHeight: 1.35,
            color: "oklch(0.78 0.13 168)",
            maxWidth: 820,
            fontWeight: 500,
          }}
        >
          Meetups and hackathons for Singapore builders (65labs)
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 56,
            left: 72,
            fontSize: 20,
            color: "oklch(0.66 0.025 245)",
          }}
        >
          aievents.sg
        </div>
      </div>
    ),
    { ...size },
  );
}
