import { CircleProps } from "../constants";

type ShapeType = "circle" | "blob" | "wave" | "organic";

interface ShapeProps {
  type: ShapeType;
  color: string;
  x: number;
  y: number;
  size: number;
}

export function generateRandomShape(color: string): ShapeProps {
  const shapes: ShapeType[] = ["circle", "blob", "wave", "organic"];
  const type = shapes[Math.floor(Math.random() * shapes.length)];

  return {
    type,
    color,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 30,
  };
}

export function renderShape(shape: ShapeProps): string {
  const generateBlobPath = () => {
    const points = 8;
    const radius = 30;
    const variance = 0.4; // Controls how much the points can deviate

    let path = `M ${shape.x + radius} ${shape.y} `;

    for (let i = 1; i <= points; i++) {
      const angle = (i * 2 * Math.PI) / points;
      const r = radius * (1 + (Math.random() - 0.5) * variance);
      const x = shape.x + r * Math.cos(angle);
      const y = shape.y + r * Math.sin(angle);

      const prevAngle = ((i - 1) * 2 * Math.PI) / points;
      const cpRadius = radius * (1.2 + Math.random() * 0.4); // Control point radius

      const cp1x = shape.x + cpRadius * Math.cos(prevAngle + Math.PI / points);
      const cp1y = shape.y + cpRadius * Math.sin(prevAngle + Math.PI / points);
      const cp2x = shape.x + cpRadius * Math.cos(angle - Math.PI / points);
      const cp2y = shape.y + cpRadius * Math.sin(angle - Math.PI / points);

      path += `C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${x} ${y} `;
    }

    return path + "Z";
  };

  const generateWavePath = () => {
    const width = 60;
    const height = 40;
    const startX = shape.x - width / 2;
    const startY = shape.y;

    let path = `M ${startX} ${startY} `;
    path += `C ${startX + width * 0.3} ${startY - height}, 
             ${startX + width * 0.7} ${startY + height}, 
             ${startX + width} ${startY} `;
    path += `C ${startX + width * 0.7} ${startY - height / 2}, 
             ${startX + width * 0.3} ${startY + height / 2}, 
             ${startX} ${startY}`;
    return path;
  };

  const generateOrganicPath = () => {
    const points = 12;
    const radius = 25 + Math.random() * 15;
    let path = "";

    for (let i = 0; i <= points; i++) {
      const angle = (i * 2 * Math.PI) / points;
      const r = radius * (1 + Math.sin(angle * 3) * 0.3);
      const x = shape.x + r * Math.cos(angle);
      const y = shape.y + r * Math.sin(angle);

      if (i === 0) path += `M ${x} ${y} `;
      else {
        const cp1x = shape.x + radius * 1.5 * Math.cos(angle - Math.PI / 6);
        const cp1y = shape.y + radius * 1.5 * Math.sin(angle - Math.PI / 6);
        path += `Q ${cp1x} ${cp1y}, ${x} ${y} `;
      }
    }

    return path + "Z";
  };

  switch (shape.type) {
    case "circle":
      return `<circle cx="${shape.x}" cy="${shape.y}" r="${shape.size}" fill="${shape.color}" opacity="0.8"/>`;
    case "blob":
      return `<path d="${generateBlobPath()}" fill="${
        shape.color
      }" opacity="0.8"/>`;
    case "wave":
      return `<path d="${generateWavePath()}" fill="${
        shape.color
      }" opacity="0.8"/>`;
    case "organic":
      return `<path d="${generateOrganicPath()}" fill="${
        shape.color
      }" opacity="0.8"/>`;
  }
}

export function drawShape(
  ctx: CanvasRenderingContext2D,
  shape: ReturnType<typeof generateRandomShape>,
  circle: CircleProps
) {
  const path = new Path2D();

  // Scale coordinates to canvas size
  const x = (circle.cx / 100) * ctx.canvas.width;
  const y = (circle.cy / 100) * ctx.canvas.height;

  // Generate blob path
  const points = 6;
  const radiusPercent = circle.r ?? 22;
  const radius =
    (radiusPercent / 100) * Math.min(ctx.canvas.width, ctx.canvas.height);
  const variance = 0.4;

  path.moveTo(x + radius, y);

  for (let i = 1; i <= points; i++) {
    const angle = (i * 2 * Math.PI) / points;
    const r = radius * (1 + (Math.random() - 0.5) * variance);
    const pointX = x + r * Math.cos(angle);
    const pointY = y + r * Math.sin(angle);

    const prevAngle = ((i - 1) * 2 * Math.PI) / points;
    const cpRadius = radius * (1.2 + Math.random() * 0.4);

    const cp1x = x + cpRadius * Math.cos(prevAngle + Math.PI / points);
    const cp1y = y + cpRadius * Math.sin(prevAngle + Math.PI / points);
    const cp2x = x + cpRadius * Math.cos(angle - Math.PI / points);
    const cp2y = y + cpRadius * Math.sin(angle - Math.PI / points);

    path.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, pointX, pointY);
  }

  path.closePath();
  ctx.fillStyle = circle.color;
  ctx.fill(path);
}
