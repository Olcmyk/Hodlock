"use client";

export function PenaltyCurveTooltip() {
  // Generate curve points for t^2 / (t + 365)
  const points: { x: number; y: number }[] = [];
  for (let t = 0; t <= 730; t += 10) {
    const y = (t * t) / (t + 365);
    points.push({ x: t, y });
  }

  const maxY = Math.max(...points.map((p) => p.y));
  const width = 280;
  const height = 150;
  const padding = 30;

  const pathD = points
    .map((p, i) => {
      const x = padding + (p.x / 730) * (width - padding * 2);
      const y = height - padding - (p.y / maxY) * (height - padding * 2);
      return `${i === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");

  return (
    <div className="p-4">
      <p className="text-xs text-gray-400 mb-2 text-center">
        Lock longer for more rewards
      </p>
      <svg width={width} height={height} className="mx-auto">
        {/* Axes */}
        <line
          x1={padding}
          y1={height - padding}
          x2={width - padding}
          y2={height - padding}
          stroke="#e5e7eb"
          strokeWidth={1}
        />
        <line
          x1={padding}
          y1={padding}
          x2={padding}
          y2={height - padding}
          stroke="#e5e7eb"
          strokeWidth={1}
        />

        {/* Curve */}
        <path
          d={pathD}
          fill="none"
          stroke="#ec4899"
          strokeWidth={2}
          strokeLinecap="round"
        />

        {/* Labels */}
        <text x={width / 2} y={height - 5} textAnchor="middle" className="text-[10px] fill-gray-500">
          Lock Duration (days)
        </text>
        <text
          x={10}
          y={height / 2}
          textAnchor="middle"
          transform={`rotate(-90, 10, ${height / 2})`}
          className="text-[10px] fill-gray-500"
        >
          Share Weight
        </text>
      </svg>
      <p className="text-xs text-gray-400 mt-2 text-center">
        Claimable penalty share vs lock duration
      </p>
    </div>
  );
}
