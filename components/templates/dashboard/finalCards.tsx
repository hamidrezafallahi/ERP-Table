"use client";
import React, {
  useEffect,
  useState,
} from 'react';

import DocumentCard from './documentCard';
import InvoiceCard from './invoiceCard';

interface ApiResponse {
  invoices: { today: number; total: number; percentage: number };
  documents: { today: number; total: number; percentage: number };
}

export default function FinalCards() {
  const [data, setData] = useState<ApiResponse | null>(null);

  useEffect(() => {
    fetch("/stats.json")
      .then((res) => res.json())
      .then((data: ApiResponse) => setData(data));
  }, []);

  if (!data) return <div>در حال بارگذاری...</div>;

  return (
    <div className="flex flex-col gap-4">
      <InvoiceCard
        today={data.invoices.today}
        total={data.invoices.total}
        percentage={data.invoices.percentage}
      />
      <DocumentCard
        today={data.documents.today}
        total={data.documents.total}
        percentage={data.documents.percentage}
      />
    </div>
  );
}
