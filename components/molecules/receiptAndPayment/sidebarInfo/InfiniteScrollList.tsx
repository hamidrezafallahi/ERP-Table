import { Skeleton } from "antd";
import { CustomButton } from "@components/atoms/defaultElements";
import { InfiniteScrollListProps } from "./type";

export default function InfiniteScrollList({
  items,
  selectedId,
  showSkeleton,
  totalCount,
  setPage,
  onSelectItem,
}: InfiniteScrollListProps) {

  const handleInfinite = (e: any) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;

    if (scrollTop + clientHeight >= scrollHeight - 10 && !showSkeleton) {
      if (items.length < totalCount) {
        setPage(prev => prev + 1);
      }
    }
  };

  return (
    <div
      className="flex flex-col gap-2 p-2 h-full overflow-auto"
      onScroll={handleInfinite}
    >
      {items.map(item => (
        <div key={item.id} className="border-b last:border-b-0">
          <CustomButton
            type="text"
            className={`${
              selectedId === item.id && "bg-blue-blue11"
            } mb-1 flex rounded-lg w-full !min-h-10 text-xs`}
            onClick={() => onSelectItem(item)}
          >
            <span className="min-w-0 flex-1 text-right overflow-hidden whitespace-nowrap text-ellipsis block">
              {item.label}
            </span>
          </CustomButton>
        </div>
      ))}

      {showSkeleton && (
        <div className="flex flex-col gap-3">
          <Skeleton.Button active style={{ width: "100%" }} />
          <Skeleton.Button active style={{ width: "100%" }} />
          <Skeleton.Button active style={{ width: "100%" }} />
        </div>
      )}
    </div>
  );
}