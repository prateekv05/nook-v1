export default function Skeleton({ width = '100%', height, borderRadius = '8px', style }) {
  return (
    <div
      className="shimmer"
      style={{ width, height, borderRadius, ...style }}
    />
  );
}
