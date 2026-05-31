import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ locale }) => {
  const locales = ['en', 'fa'];

  const currLocale = locales.includes(locale) ? locale : 'fa';

  return {
    locale: currLocale,
    messages: (await import(`../message/${currLocale}.json`)).default,
  };
});