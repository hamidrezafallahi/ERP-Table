export const getTokens = (Name: string): { val: string; valid: boolean } => {
  const cookies = document.cookie.split(";");
  const cookie = cookies.find((x) => x.includes(`${Name}=`));
  if (cookie) {
    const result = cookie.split("=");
    if (result[1] !== "") {
      return { val: result[1], valid: true };
    } else {
      return { val: "", valid: false };
    }
  }
  return { val: "", valid: false };
};
export const createCookie = (
  cookieName: string,
  cookieValue: string,
  hourToExpire?: number,
  infinite?: boolean,
) => {
  const date = new Date();
  const defaultHour = hourToExpire ?? 8;
  date.setTime(date.getTime() + defaultHour * 60 * 60 * 1000);
  if (infinite) {
    document.cookie = `${cookieName}=${cookieValue};`;
  } else {
    document.cookie = `${cookieName}=${cookieValue}; expires=${date.toUTCString()}; path=/;`;
  }
};
export const getCookie = (Name: string): string => {
  const cookies = document.cookie.split(";");
  const cookie = cookies.find((x) => x.includes(`${Name}=`));
  if (cookie) {
    const result = cookie.split("=");
    if (result[1] !== "") {
      return result[1];
    } else {
      return "";
    }
  }
  return "";
};
export const deleteCookie = (name: string) => {
  const cookies = document.cookie.split(";");
  const cookie = cookies.find((x) => x.includes(`${name}=`));
  if (cookie) {
    const cookieName = cookie.split("=")[0];
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
  }
};