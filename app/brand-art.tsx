/* Shared art for the generated icon and social image (rendered by next/og). */

export const MESH = [
  "radial-gradient(circle at 12% 18%, #14b8a6 0%, rgba(20,184,166,0) 48%)",
  "radial-gradient(circle at 88% 16%, #7dd3c0 0%, rgba(125,211,192,0) 52%)",
  "radial-gradient(circle at 22% 100%, #1e5bb8 0%, rgba(30,91,184,0) 60%)",
  "radial-gradient(circle at 92% 96%, #38bdf8 0%, rgba(56,189,248,0) 55%)",
  "radial-gradient(circle at 55% 55%, #0ea5a4 0%, rgba(14,165,164,0) 40%)",
].join(", ")

export function MarkArt({ size }: { size: number }) {
  const r = size * 0.28
  const dot = size * 0.26
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: r,
        backgroundColor: "#03203a",
        backgroundImage: MESH,
        position: "relative",
        display: "flex",
        boxShadow: "inset 0 0 0 2px rgba(255,255,255,0.16)",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: size * 0.64 - dot / 2,
          top: size * 0.375 - dot / 2,
          width: dot,
          height: dot,
          borderRadius: dot,
          backgroundColor: "#2dd4bf",
          boxShadow: "0 0 0 2px rgba(0,0,0,0.2)",
          border: `${Math.max(2, size * 0.06)}px solid white`,
        }}
      />
    </div>
  )
}
