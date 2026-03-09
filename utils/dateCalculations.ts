export function calculateDaysUntilPayday(
  frequency: 'monthly' | 'bi-weekly',
  paymentDays: number[]
): number {
  const today = new Date();
  const currentDay = today.getDate();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  if (frequency === 'monthly') {
    const paymentDay = paymentDays[0];
    const nextPayDate = new Date(currentYear, currentMonth, paymentDay);

    if (currentDay >= paymentDay) {
      nextPayDate.setMonth(currentMonth + 1);
    }

    const daysInNextMonth = new Date(
      nextPayDate.getFullYear(),
      nextPayDate.getMonth() + 1,
      0
    ).getDate();

    if (paymentDay > daysInNextMonth) {
      nextPayDate.setDate(daysInNextMonth);
    }

    const diffTime = nextPayDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  } else {
    const sortedDays = [...paymentDays].sort((a, b) => a - b);
    let closestPayday: Date | null = null;
    let minDiff = Infinity;

    for (const day of sortedDays) {
      const payDate = new Date(currentYear, currentMonth, day);

      if (payDate >= today) {
        const diff = payDate.getTime() - today.getTime();
        if (diff < minDiff) {
          minDiff = diff;
          closestPayday = payDate;
        }
      }
    }

    if (!closestPayday) {
      const nextMonth = currentMonth + 1;
      const nextMonthDate = new Date(currentYear, nextMonth, sortedDays[0]);
      closestPayday = nextMonthDate;
    }

    const diffTime = closestPayday.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}

export function getMoodCategory(daysRemaining: number): string {
  if (daysRemaining <= 3) return 'happy';
  if (daysRemaining <= 7) return 'neutral';
  if (daysRemaining <= 14) return 'worried';
  return 'sad';
}
