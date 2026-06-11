// components/CardSimple.tsx

import { ForwardedRef, forwardRef, ReactElement } from "react";
import { getColoredIcon } from "@utils/core";
import { CustomSwitch } from "@components/atoms/defaultElements";

import { CardSimpleProps } from "./type";

function CardSimpleInner<
  T extends { Inactive: boolean; PendingStatusId: number },
>(
  {
    item,
    index,
    processedDataLength,
    columnsConfig,
    actions,
    fieldKey,
    activation,
    mode,
    onActionClick,
  }: CardSimpleProps<T>,
  ref: ForwardedRef<HTMLDivElement>,
) {
  return (
    <div
      ref={index === processedDataLength - 1 ? ref : null}
      className={`${actions.length > 1 ? "flex-col" : "flex-row"} p-4 flex gap-4 items-start justify-between  bg-gray-gray1 rounded-lg border-2 border-gray-gray05`}
    >
      <div className="flex gap-1 flex-1">
        {columnsConfig?.map((el: any, idx: number) => (
          <div key={idx} className="flex text-sm text-justify text-gray-gray10">
            <p>{item[el.fieldName]}</p>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-3 w-auto">
        {actions?.map((action: any) => (
          <span
            key={action.MenuDesc}
            className="cursor-pointer"
            onClick={() => {
              onActionClick(
                action,
                item[fieldKey],
                item["PendingStatusId"],
                item,
              );
            }}
          >
            {typeof action.Icon === "string" ? (
              <div
                dangerouslySetInnerHTML={{
                  __html: getColoredIcon(action.Icon, mode),
                }}
              />
            ) : (
              action.Icon
            )}
          </span>
        ))}

        {activation?.url && (
          <CustomSwitch
            config={{
              fieldKey,
              url: activation.url,
              id: item[fieldKey],
              body: activation.body,
            }}
            defaultChecked={!item.Inactive}
          />
        )}
      </div>
    </div>
  );
}

export const CardSimple = forwardRef(CardSimpleInner) as <
  T extends { Inactive: boolean; PendingStatusId: number },
>(
  props: CardSimpleProps<T> & { ref?: ForwardedRef<HTMLDivElement> },
) => ReactElement;
