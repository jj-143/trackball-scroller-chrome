export function calcMultiplier(sensitivity: number): number {
  // returns actual multiplier that applied to calculation
  // allowed sensitivity range: 1 - 20, default: 10

  return sensitivity <= 10
    ? sensitivity * 0.1
    : sensitivity < 15
    ? 1 + (sensitivity - 10) * 0.1
    : 1.5 + (sensitivity - 15) * 0.3
}
