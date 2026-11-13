/* Shared art for the generated icon and social image (rendered by next/og). */

export const MESH = [
  "radial-gradient(circle at 12% 18%, #ff8a3d 0%, rgba(255,138,61,0) 48%)",
  "radial-gradient(circle at 88% 16%, #ff3d7f 0%, rgba(255,61,127,0) 52%)",
  "radial-gradient(circle at 22% 100%, #3d63ff 0%, rgba(61,99,255,0) 60%)",
  "radial-gradient(circle at 92% 96%, #9b5cff 0%, rgba(155,92,255,0) 55%)",
  "radial-gradient(circle at 55% 55%, #ff6a5c 0%, rgba(255,106,92,0) 40%)",
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
        backgroundColor: "#1b1c1f",
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
          backgroundColor: "#ff3d7f",
          border: `${Math.max(2, size * 0.06)}px solid white`,
        }}
      />
    </div>
  )
}
