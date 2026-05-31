"use client";
import Title from '@components/atoms/Title';
import OfficeReportTemplate from '@components/templates/report/officeReport';

export default function Page() {
  return (
    <>
      <Title caption={"title.officeReport"} />
      <OfficeReportTemplate />
    </>
  );
}
