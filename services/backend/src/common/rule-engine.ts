export function isDateExpired(dateValue: Date): boolean {
  const today = new Date();
  const midnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return dateValue < midnight;
}
