import moment from 'moment-jalaali';

import { FieldType } from '../bootstrap/type';

export const valueParser = (val, type: FieldType, locale: string = "fa", t: (e: string) => string = () => "انتخاب کنید") => {
    if (val == null || val == undefined) {
        if (type == "selectOption") {
            return t?.("general.selectField");
        } else {
            return "";
        }
    }

    switch (type) {
        case "text":
        case "description":
        case "number":
        case "select":
        case "selectOption":
        case "static":
            return val;
        case "checkbox":
            return val ? "✔" : "✘";
        case "price":
            return `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        case "date":
            if (locale === "fa") {
                return moment(val).format("jYYYY/jMM/jDD");
            } else {
                return moment(val).format("YYYY/MM/DD");
            }
        default:
            return "—";
    }
};