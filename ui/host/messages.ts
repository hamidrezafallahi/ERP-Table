export type ERPTableLocale = 'fa' | 'en';

export type ERPTableMessages = Record<string, string>;

export const FA_MESSAGES: ERPTableMessages = {
  'general.addNewRow': 'افزودن سطر',
  'general.copy': 'کپی',
  'general.cut': 'برش',
  'general.paste': 'چسباندن',
  'general.delete': 'حذف',
  'general.chooseFromList': 'انتخاب از لیست',
  'general.toggle': 'انتخاب همه',
  'general.exportToExcel': 'خروجی اکسل',
  'general.exportToExcelSuccess': 'خروجی اکسل با موفقیت انجام شد',
  'general.exportToExcelError': 'خروجی اکسل ناموفق بود',
  'general.selected': 'انتخاب شده',
  'general.search': 'جستجو',
  'general.selectField': 'انتخاب کنید',
  'general.choice': 'انتخاب ستون',
  'general.prev': 'قبلی',
  'general.next': 'بعدی',
  'general.noData': 'داده‌ای وجود ندارد',
  'general.replicateRow': 'تکثیر سطر',
  'general.edit': 'ویرایش',
  'general.rowEdit': 'ویرایش سطر',
  'general.row': 'سطر',
  'general.save': 'ذخیره',
  'general.notActive': 'غیرفعال',
  'general.add': 'افزودن',
  'general.themeDark': 'تم تیره',
  'general.themeLight': 'تم روشن',
};

export const EN_MESSAGES: ERPTableMessages = {
  'general.addNewRow': 'Add row',
  'general.copy': 'Copy',
  'general.cut': 'Cut',
  'general.paste': 'Paste',
  'general.delete': 'Delete',
  'general.chooseFromList': 'Choose from list',
  'general.toggle': 'Select all',
  'general.exportToExcel': 'Export to Excel',
  'general.exportToExcelSuccess': 'Excel export succeeded',
  'general.exportToExcelError': 'Excel export failed',
  'general.selected': 'Selected',
  'general.search': 'Search',
  'general.selectField': 'Select',
  'general.choice': 'Choose column',
  'general.prev': 'Previous',
  'general.next': 'Next',
  'general.noData': 'No data',
  'general.replicateRow': 'Duplicate row',
  'general.edit': 'Edit',
  'general.rowEdit': 'Edit row',
  'general.row': 'Row',
  'general.save': 'Save',
  'general.notActive': 'Inactive',
  'general.add': 'Add',
  'general.themeDark': 'Dark theme',
  'general.themeLight': 'Light theme',
};

export function translate(
  key: string,
  locale: ERPTableLocale,
  overrides?: Partial<ERPTableMessages>,
): string {
  const pack = locale === 'en' ? EN_MESSAGES : FA_MESSAGES;
  return overrides?.[key] ?? pack[key] ?? key;
}
