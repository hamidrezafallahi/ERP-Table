"use client";
import Title from '@components/atoms/Title';
import ComparativeReportTemplate
  from '@components/templates/report/comparativeReport';

export default function Page() {
  return (
    <>
      <Title caption={"title.comparativeReport"} />
      <ComparativeReportTemplate />
    </>
  );
}
