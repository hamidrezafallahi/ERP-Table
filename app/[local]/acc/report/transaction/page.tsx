"use client";
import Title from "@components/atoms/Title";
import TransactionTemplate from "@components/templates/report/transaction";

export default function Page() {
  return (
    <>
      <Title caption={"title.transaction"} />
      <TransactionTemplate />
    </>
  );
}
