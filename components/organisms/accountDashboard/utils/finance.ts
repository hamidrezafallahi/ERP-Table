export function calculateFinance({
  title = "",
  data,
}: {
  title?: string;
  data?: {
    Current?: number | number[];
    Previous?: number | number[];
  };
}) {
  const extractValue = (value: number | number[] | undefined): number => {
    if (Array.isArray(value)) {
      if (value.length === 0) return 0;
      return Number(value[value.length - 1]); // آخرین مقدار مثلا برای KPIs
    }
    return Number(value ?? 0);
  };

  const previousValue = Math.abs(extractValue(data?.Previous));
  const currentValue = Math.abs(extractValue(data?.Current));

  const currentRawForDisplay = Array.isArray(data?.Current)
    ? data!.Current.reduce((sum, item) => sum + Math.abs(item), 0)
    : currentValue;

  const formattedCurrent = currentRawForDisplay.toLocaleString("fa-IR");

  let growth = 0;

  if (previousValue === 0 && currentValue > 0) {
    growth = 100;
  } else if (previousValue !== 0) {
    growth = ((currentValue - previousValue) / previousValue) * 100;
  }

  const growthPercent = Math.round(growth);

  const color = (title || "").toString().includes("Expense")
    ? growth < 0
      ? "text-green-600"
      : growth > 0
        ? "text-red-600"
        : "text-gray-gray10"
    : growth < 0
      ? "text-red-600"
      : growth > 0
        ? "text-green-600"
        : "text-gray-gray10";

  return {
    previous: previousValue,
    current: currentValue,
    currentList: Array.isArray(data?.Current) ? data?.Current : null,
    formattedCurrent,
    growth,
    growthPercent,
    color,
  };
}
