import { FieldType } from '../bootstrap/type';

export const valueParser = (
  val: unknown,
  type: FieldType
): React.ReactNode => {

  if (val == null) {
    return type === "selectOption"
      ? "انتخاب کنید"
      : "";
  }

  switch (type) {
    case "text":
    case "description":
    case "number":
    case "select":
    case "selectOption":
    case "static":
      return String(val);

    case "checkbox":
      return val ? "✔" : "✘";

    case "price":
      return `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    case "date":
      console.log(val)
      if (typeof val === 'string' && val.length>0) {
        return new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        }).format(new Date(val as string));
      } else {
        return null
      }
    default:
      return "—";
  }
};