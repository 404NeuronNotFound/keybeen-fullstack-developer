/** Spread the tools over a sphere, rather than stacking flat rings. */
export function createSkillSphere(count: number) {
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  return Array.from({ length: count }, (_, index) => {
    const y = 1 - 2 * (index + 0.5) / count;
    const radius = Math.sqrt(1 - y * y);
    return { x: Math.cos(index * goldenAngle) * radius, y, z: Math.sin(index * goldenAngle) * radius };
  });
}

type SpherePoint = { x: number; y: number; z: number };

/** A fixed tilted axis carries the tools upward, around, and behind the person. */
export function rotateSkillSphere(point: SpherePoint, angle: number): SpherePoint {
  const length = Math.hypot(0.42, 0.78, 0.46);
  const ax = 0.42 / length, ay = 0.78 / length, az = 0.46 / length;
  const cos = Math.cos(angle), sin = Math.sin(angle);
  const dot = ax * point.x + ay * point.y + az * point.z;
  return {
    x: point.x * cos + (ay * point.z - az * point.y) * sin + ax * dot * (1 - cos),
    y: point.y * cos + (az * point.x - ax * point.z) * sin + ay * dot * (1 - cos),
    z: point.z * cos + (ax * point.y - ay * point.x) * sin + az * dot * (1 - cos),
  };
}

export function projectSkillSphere(point: SpherePoint, angle: number, pitch = -0.1, yaw = 0) {
  const rotated = rotateSkillSphere(point, angle);
  const x = rotated.x * Math.cos(yaw) + rotated.z * Math.sin(yaw);
  const depth = rotated.z * Math.cos(yaw) - rotated.x * Math.sin(yaw);
  const y = rotated.y * Math.cos(pitch) - depth * Math.sin(pitch);
  const z = rotated.y * Math.sin(pitch) + depth * Math.cos(pitch);
  const perspective = 1 / (1 - z * 0.14);
  return { x: x * perspective, y: y * perspective, z, scale: 0.6 + (z + 1) * 0.23, opacity: 0.28 + (z + 1) * 0.36, layer: z >= 0 ? 41 + Math.round(z * 29) : 1 + Math.round((z + 1) * 28) };
}

/** Match the pivot to the seated figure as the cover photo crops. */
export function getSkillSphereLayout(width: number, height: number) {
  const coverScale = Math.max(width / 1672, height / 941);
  // Bottom-align the photo to keep the figure visible and free space above it.
  const centerY = height - (941 - 610) * coverScale;
  const radiusX = Math.min(width * 0.39, height * 0.62);
  const radiusY = Math.max(80, Math.min(height * 0.34, height - centerY - 52));
  return { centerX: width / 2, centerY, radiusX, radiusY };
}
