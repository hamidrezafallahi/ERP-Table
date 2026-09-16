import { CustomButton } from '../primitives';
import {
  formatLocaleNumber,
  useLocale,
  useNumberingSystem,
  useTranslations,
} from '../host';

interface Props {
  onClick: () => void;
  visibleCount: number;
  totalRows: number;
}

export function MobileLoadMoreButton({
  onClick,
  visibleCount,
  totalRows,
}: Props) {
  const t = useTranslations();
  const locale = useLocale();
  const numberingSystem = useNumberingSystem();
  const visible = formatLocaleNumber(visibleCount, {
    locale,
    numberingSystem,
  });
  const total = formatLocaleNumber(totalRows, { locale, numberingSystem });

  return (
    <div className="shrink-0 w-full py-3 border-gray-gray5 border-t bg-main-white">
      <CustomButton
        htmlType="button"
        type="default"
        className="w-full h-10 text-sm"
        onClick={onClick}
      >
        {t('general.loadMore', { visible, total })}
      </CustomButton>
    </div>
  );
}
