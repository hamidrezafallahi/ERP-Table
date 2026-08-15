import { CustomButton } from '@components/atoms/defaultElements';

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
  return (
    <div className="shrink-0 w-full py-3 border-gray-gray5 border-t bg-main-white">
      <CustomButton
        htmlType="button"
        type="default"
        className="w-full h-10 text-sm"
        onClick={onClick}
      >
        نمایش بیشتر ({visibleCount.toLocaleString('fa-IR')} از{' '}
        {totalRows.toLocaleString('fa-IR')})
      </CustomButton>
    </div>
  );
}
