export const validateNationalCode = (rule, value) => {
  if (!value) {
    return Promise.reject("لطفا کد ملی را وارد کنید!");
  }
  const regex = /^(?!0000000000)(\d{10})$/;
  if (!regex.test(value)) {
    return Promise.reject("کد ملی باید 10 رقم باشد !");
  }
  const weights = [10, 9, 8, 7, 6, 5, 4, 3, 2];
  let sum = 0;

  for (let i = 0; i < 9; i++) {
    sum += parseInt(value[i]) * weights[i];
  }
  const remainder = sum % 11;
  const checkDigit = parseInt(value[9]);
  if (remainder < 2) {
    if (checkDigit !== remainder) {
      return Promise.reject("کد ملی نادرست است!");
    }
  } else {
    if (checkDigit !== 11 - remainder) {
      return Promise.reject("کد ملی نادرست است!");
    }
  }

  return Promise.resolve();
};

export const isEmail = (email: string) => {
  return !email
    ? false
    : String(email)
        .toLowerCase()
        .match(
          /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        );
};
// export const isMobile = (string: string) => {
//   try {
//     if (!string) {
//       return false;
//     }
//     const str = toEnglishNumber(string);
//     if (!isNumeric(str) || str.length !== 11 || !str.startsWith("09")) {
//       return false;
//     }
//     return true;
//   } catch (error) {
//     return false;
//   }
// };
export const changeInputHandler = ({
  e,
  changeHandler,
  currentValue,
  preventAnySpace,
  maxLength,
  acceptLang,
}: {
  e: any;
  changeHandler: (e: any) => void;
  currentValue: string;
  preventAnySpace: string;
  maxLength: number;
  acceptLang: string;
}) => {
  if (typeof preventAnySpace === "boolean") {
    if (e.target.value !== "" && preventAnySpace) {
      if (e.nativeEvent.data === " ") {
        return;
      }
    }
    if (e.target.value !== "" && !preventAnySpace) {
      if (
        currentValue &&
        currentValue.substr(currentValue.length - 1) === " " &&
        e.nativeEvent.data === " "
      ) {
        return;
      }
    }
  }
  if (maxLength) {
    if (e.target.value.length > maxLength) {
      return;
    }
  }
  if (e.target.value !== "" && acceptLang) {
    if (acceptLang === "fa" && !/^[\u0600-\u06FF\s]+$/.test(e.target.value)) {
      return;
    }
    if (acceptLang === "en" && !/[A-Za-z]/gi.test(e.target.value)) {
      return;
    }
  }
  changeHandler(e);
};
// export const isNumeric = (string:string) => {
//   return !string ? false : /^[0-9\b]+$/.test(string);
// };
export const isNumber = function (str: string) {
  if (str === "") return true;
  return new RegExp(/^\d+\.?\d*$/).test(str); // returns a boolean
};
export const correctFee = (f: any) => {
  if (f === "" || isNaN(f)) return f;
  f = String(f).split(".");
  let l = Number(f[0]).toLocaleString("en-US") + ".";
  l = l.substring(0, l.indexOf("."));
  return l + (typeof f[1] === "string" ? "." + f[1] : "");
};
export const correctNumberVal = (args: {
  value: string;
  floatCount?: number;
  isSeparator?: boolean;
}) => {
  const { value, floatCount = 0, isSeparator } = args;
  if (value === "" || isNaN(Number(value))) return value;
  const num = (
    floatCount !== 0 || isSeparator
      ? Number(value).toFixed(Number(floatCount))
      : value
  ).toString();
  return (isSeparator ? correctFee(num) : num).replace(/\.0+$/, "");
};
export const toEnglishNumber = (str: string) => {
  return str
    .toString()
    .replace(/۰/g, "0")
    .replace(/۱/g, "1")
    .replace(/۲/g, "2")
    .replace(/۳/g, "3")
    .replace(/۴/g, "4")
    .replace(/۵/g, "5")
    .replace(/۶/g, "6")
    .replace(/۷/g, "7")
    .replace(/۸/g, "8")
    .replace(/۹/g, "9")
    .replace(/٠/g, "0")
    .replace(/١/g, "1")
    .replace(/٢/g, "2")
    .replace(/٣/g, "3")
    .replace(/٤/g, "4")
    .replace(/٥/g, "5")
    .replace(/٦/g, "6")
    .replace(/٧/g, "7")
    .replace(/٨/g, "8")
    .replace(/٩/g, "9");
};
export const toPersianNumber = (str: string) => {
  return str
    .toString()
    .replace(/0/g, "۰")
    .replace(/1/g, "۱")
    .replace(/2/g, "۲")
    .replace(/3/g, "۳")
    .replace(/4/g, "۴")
    .replace(/5/g, "۵")
    .replace(/6/g, "۶")
    .replace(/7/g, "۷")
    .replace(/8/g, "۸")
    .replace(/9/g, "۹")
    .replace(/٠/g, "۰")
    .replace(/١/g, "۱")
    .replace(/٢/g, "۲")
    .replace(/٣/g, "۳")
    .replace(/٤/g, "۴")
    .replace(/٥/g, "۵")
    .replace(/٦/g, "۶")
    .replace(/٧/g, "۷")
    .replace(/٨/g, "۸")
    .replace(/٩/g, "۹");
};
