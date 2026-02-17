import React from "react";

import { CustomButton } from "@components/atoms/defaultElements";
import { DarkModeIcon, LightModeIcon } from "@components/atoms/iconComponents";
import { useDarkMode } from "@hooks/custom/useDarkMode";
import { TTheme } from "@slice/config/type";

function SwitchMode() {
  const { mode = "light", setMode } = useDarkMode();

  const handleSetMode = () => {
    const next: TTheme = mode === "light" ? "dark" : "light";
    setMode(next);
  };

  return (
    <CustomButton
      shape="circle"
      type="text"
      onClick={handleSetMode}
      aria-label="toggle-theme"
      className="items-start"
    >
      {mode === "light" ? <DarkModeIcon /> : <LightModeIcon />}
    </CustomButton>
  );
}

export default SwitchMode;
