"use client";
import Title from "@components/atoms/Title";
import ReportTemplate from "@components/templates/report/accounting";

export default function Page() {
  return (
    <>
      <Title caption={"title.accounting"} />
      <ReportTemplate />
    </>
  );
}
