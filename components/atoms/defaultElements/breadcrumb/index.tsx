"use client";
import { Breadcrumb } from 'antd';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';

export const CustomBreadcrumb = ( ) => {
  const t = useTranslations("title");
  const path = usePathname();
  const routes = path
    .split("/")
    .slice(2)
    .map((item) => ({
      title: t(item),
    }));
  return <Breadcrumb separator=">" className="text-xs" items={routes} />;

  // return(<h1>{t('title')}</h1>);
};
