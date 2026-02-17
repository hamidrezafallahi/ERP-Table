import Form from "@components/templates/form";

export default function FinalizeVoucherPage() {
  return (
    <Form<null, null>
      titleKey=""
      fieldKey=""
      caption={"title.finalizeVoucher"}
      url={null}
      listUrl={null}
      submitCaption="قطعی کردن اسناد"
      hasShorthandFormToolbar={false}
    />
  );
}
