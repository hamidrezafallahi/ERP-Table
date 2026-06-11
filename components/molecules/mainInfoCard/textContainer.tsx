import { CustomTooltip } from "@components/atoms/defaultElements";
import { useTranslations } from "next-intl";
import React from "react";

interface TextContainerProps {
  label: string;
  titleGroup: string;
  description: string;
}

const TextContainer = (props: TextContainerProps) => {
  const { description, label, titleGroup } = props;
  const t = useTranslations();
  return (
    <div className="flex flex-col justify-center gap-2 w-full overflow-hidden">
      <div className=" text-gray-gray9 text-sm truncate">
        {titleGroup ? t(`${titleGroup}.${label}`) : label}
      </div>
      {description && (
        <CustomTooltip title={description}>
          <div className="text-2xs text-gray-gray7 line-clamp-4">
            {description}
          </div>
        </CustomTooltip>
      )}
    </div>
  );
};
export default TextContainer;
