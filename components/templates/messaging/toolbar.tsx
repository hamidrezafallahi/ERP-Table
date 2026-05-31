import { useTranslations } from 'next-intl';
import { shallowEqual } from 'react-redux';

import { CustomButton } from '@components/atoms/defaultElements';
import ExpandedButton from '@components/molecules/expandedButton';
import { useAppSelector } from '@hooks/custom/useAppSelector';

interface SubmitProps {
  submit: () => void;
}
export const Toolbar = ({ ...props }: SubmitProps) => {
  const { locale } = useAppSelector(
    (state) => ({
      locale: state.withPersist.config.lang,
      isFullScreen: state.withPersist.config.fullScreen,
    }),
    shallowEqual
  );

  return (
    <div
      className={`absolute -top-14 z-10 flex gap-2  ${
        locale === "fa" ? "-left-3 " : "-right-3 "
      }`}
    >
      <ExpandedButton />
      <SubmitButton {...props} />
    </div>
  );
};

const SubmitButton = ({ ...props }: SubmitProps) => {
  const { submit } = props;
  const t = useTranslations();
  return (
    <CustomButton
      type="text"
      className="bg-main-black hover:bg-main-white dark:bg-main-white px-2 border-none rounded h-9 text-main-white dark:text-main-black"
      onClick={submit}
    >
      {t("general.send")}
    </CustomButton>
  );
};
