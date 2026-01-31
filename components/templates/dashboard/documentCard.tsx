import React from 'react';

import StatCard from './statsCard';

interface DocumentProps {
  today: number;
  total: number;
  percentage: number;
}

export default function DocumentCard({
  today,
  total,
  percentage,
}: DocumentProps) {
  return (
    <StatCard
      title="اسناد ثبت شده"
      todayCount={today}
      totalCount={total}
      percentage={percentage}
    />
  );
}
