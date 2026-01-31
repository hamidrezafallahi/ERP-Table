import React, { useMemo, useState } from "react";

export default function usePhoneInput(initial = "") {
  const [value, setValue] = useState(initial);
  const onlyDigits = (v: string) => v.replace(/\D+/g, "");

  const setFromChange = (raw: string) => setValue(onlyDigits(raw));

  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    const allowedCtrlCmd =
      (e.ctrlKey || e.metaKey) &&
      ["a", "c", "v", "x"].includes(e.key.toLowerCase());
    const navigationKeys = [
      "Backspace",
      "Delete",
      "ArrowLeft",
      "ArrowRight",
      "ArrowUp",
      "ArrowDown",
      "Home",
      "End",
      "Tab",
    ];

    if (
      allowedCtrlCmd ||
      navigationKeys.includes(e.key) ||
      /^\d$/.test(e.key)
    ) {
      return;
    }
    e.preventDefault();
  };

  const handleBeforeInput: React.FormEventHandler<HTMLInputElement> = (
    e: any
  ) => {
    const data = e?.nativeEvent?.data as string | undefined;
    if (data && /\D/.test(data)) e.preventDefault();
  };

  const handlePaste: React.ClipboardEventHandler<HTMLInputElement> = (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text");
    const digits = onlyDigits(text);
    setValue((prev) => (prev ? onlyDigits(prev + digits) : digits));
  };

  const isValid = useMemo(() => /^\d{11}$/.test(value), [value]);

  return {
    value,
    setValue: setFromChange,
    isValid,
    handleKeyDown,
    handleBeforeInput,
    handlePaste,
    onlyDigits,
  } as const;
}
