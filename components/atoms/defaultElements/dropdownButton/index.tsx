import { Dropdown } from "antd";

import type { IProps } from "./type";
import { useState } from "react";

export const CustomDropdownButton = ({ ...props }: IProps) => {
  const [internalOpen, setInternalOpen] = useState(false);

  const isControlled = typeof props.isOpen === "boolean";
  const openState = isControlled ? props.isOpen : internalOpen;
  const setOpenState = isControlled ? props.setIsOpen : setInternalOpen;
  const {
    text,
    items,
    className,
    icon,
    placement,
    arrow,
    trigger,
    more,
    loading,
    danger,
    onClick,
    type,
    size,
    style,
    children,
    onButtonClick,
    popupRender,
    dropdownClassName,
  } = props;
  if (more) {
    return (
      <Dropdown.Button
        icon={icon}
        onClick={onButtonClick}
        menu={{ items }}
        type={type}
        placement={placement}
        className={`*:!text-gray-gray10 !w-full bg-red-400 ${className}`}
        arrow={arrow ? { pointAtCenter: true } : false}
        trigger={trigger}
        loading={loading}
        danger={danger}
        size={size}
        style={style}
        open={openState}
        onOpenChange={setOpenState}
      >
        {text}
      </Dropdown.Button>
    );
  }

  // حالت معمولی Dropdown
  return (
    <Dropdown
      popupRender={popupRender}
      disabled={props.disabled}
      menu={{
        items,
        onClick,
        selectable: true,
        className: `h-fit max-h-[80dvh] hidden-show-scrollBar ${dropdownClassName}`,
      }}
      placement={placement}
      className={className}
      arrow={arrow ? { pointAtCenter: true } : false}
      open={openState}
      onOpenChange={setOpenState}
    >
      {/* فقط یک child مجاز هست */}
      {children}
    </Dropdown>
  );
};
