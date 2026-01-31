import { FC } from "react";

import { Tag } from "antd";

import { Close, SpinIcon } from "@components/atoms/iconComponents";
import { generateColorsFromString } from "@utils/core";

import type { IProps } from "./type";

export const CustomTag: FC<IProps> = ({
  tag,
  deleteTagHandler,
  Loading = false,
  closable = true,
  selectTagHandler,
  ...props
}) => {
  const { backgroundColor, textColor } = generateColorsFromString(tag.Title);
  return (
    <Tag
      {...props}
      onClick={selectTagHandler}
      style={{ backgroundColor: backgroundColor, color: textColor }}
      key={tag.Title}
      className={` !border-none rounded px-2 py-1 !m-0 cursor-pointer flex flex-row-reverse justify-between items-center gap-2 overflow-hidden ${props.className}`}
      closable={closable}
      closeIcon={
        Loading ? (
          <SpinIcon config={{ width: 12, height: 12 }} />
        ) : (
          <span>
            <Close config={{ width: 8, height: 8 }} />
          </span>
        )
      }
      onClose={(e) => {
        e.preventDefault();
        deleteTagHandler(tag);
      }}
    >
      <span className="w-full text-ellipsis hover:text-clip overflow-hidden">
        {tag.Title}
      </span>
    </Tag>
  );
};
