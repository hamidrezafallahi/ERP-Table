import { useEffect } from 'react';

import { useTranslations } from 'next-intl';

interface IProps {
  caption?:string
  captionII?:string
}
const Title = ({ caption,captionII=null }:IProps) => {
  const t = useTranslations();
  useEffect(() => {
    document.title = `${t("company.name")} | ${caption? t(caption):captionII}`;
  }, [caption]);

  return null;
};

export default Title;
