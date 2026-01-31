import { useEffect } from "react";

import { useTranslations } from "next-intl";

const Title = ({ caption }) => {
  const t = useTranslations();

  useEffect(() => {
    document.title = `${t("company.name")} | ${t(caption)}`;
  }, [caption]);

  return null;
};

export default Title;
