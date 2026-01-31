import React from 'react';

import StatCard from './statsCard';

interface InvoiceProps {
  today: number;
  total: number;
  percentage: number;
}

export default function InvoiceCard({
  today,
  total,
  percentage,
}: InvoiceProps) {
  return (
    <StatCard
      title="فاکتورها"
      todayCount={today}
      totalCount={total}
      percentage={percentage}
    />
  );
}
