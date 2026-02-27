/** Format a number as CLP: 45000 → "$45.000" */
export function formatCLP(amount: number): string {
  return "$" + amount.toLocaleString("es-CL");
}

/** Format minutes as duration string: 60 → "60 min" */
export function formatDuration(minutes: number): string {
  return `${minutes} min`;
}
