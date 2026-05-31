import { useTranslations } from 'next-intl';
import { shallowEqual } from 'react-redux';

import { CustomButton } from '@components/atoms/defaultElements';
import BackNavigateButton from '@components/molecules/backNavigateButton';
import ExpandedButton from '@components/molecules/expandedButton';
import { useAppSelector } from '@hooks/custom/useAppSelector';

interface SubmitProps {
  submit: () => void;
}
export const Toolbar = ({ ...props }: SubmitProps) => {
  const { direction, match } = useAppSelector(
    (state) => ({
      direction: state.withPersist.config.direction,
      match: state.withPersist.config.initMatch,
    }),
    shallowEqual
  );
  return (
    <div
      className={`absolute top-0 lg:-top-14  z-10 flex gap-2   justify-end lg:justify-between h-10 w-full lg:w-fit  ${
        direction === "rtl" ? "lg:-left-3" : "lg:-right-3"
      }`}
    >
      {match ? (
        <>
          <ExpandedButton />
          <SubmitButton {...props} />
        </>
      ) : (
        <div className="w-full">
          <BackNavigateButton />
        </div>
      )}
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
