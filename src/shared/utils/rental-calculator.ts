export function calculateTotalDays(
  pickupAt: Date,
  returnAt: Date
): number {
  if (returnAt <= pickupAt) {
    throw new Error(
      "Return date must be after pickup date"
    );
  }

  const difference =
    returnAt.getTime() - pickupAt.getTime();

  const days =
    Math.ceil(
      difference / (1000 * 60 * 60 * 24)
    );

  return Math.max(days, 1);
}